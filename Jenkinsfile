// Jenkinsfile — save in root of your project
pipeline {
  agent any   // Run on any available Jenkins agent
  // Maven & Java are expected to be installed system-wide on the Jenkins agent
  // (e.g. via: sudo apt-get install -y maven openjdk-17-jdk)
 
  // Environment variables — available to all stages
  environment {
    AWS_REGION        = 'ap-south-1'
    ECR_REGISTRY      = '381437929435.dkr.ecr.ap-south-1.amazonaws.com'
    BACKEND_IMAGE     = "${ECR_REGISTRY}/login-app/backend"
    FRONTEND_IMAGE    = "${ECR_REGISTRY}/login-app/frontend"
    K8S_NAMESPACE     = 'login-app'
    CLUSTER_NAME      = 'login-cluster'
    IMAGE_TAG         = "${BUILD_NUMBER}"  // Use build number as tag
  }
 
  stages {
 
    // ── STAGE 1: CHECKOUT ─────────────────────────────────────
    stage('Checkout') {
      steps {
        echo '=== Pulling latest code from GitHub ==='
        checkout scm   // Pulls code from configured GitHub repo
        sh 'git log --oneline -5'  // Show last 5 commits
      }
    }
 
    // ── STAGE 2: TEST BACKEND ─────────────────────────────────
    stage('Test Backend') {
      steps {
        echo '=== Running Spring Boot unit tests ==='
        dir('backend') {
          sh 'mvn test -B'   // -B = batch mode (no colour output)
        }
      }
      post {
        always {
          // Publish test results — allowEmptyResults prevents abort if mvn failed:
          junit allowEmptyResults: true, testResults: 'backend/target/surefire-reports/*.xml'
        }
      }
    }
 
    // ── STAGE 3: BUILD BACKEND JAR ────────────────────────────
    stage('Build Backend') {
      steps {
        echo '=== Building Spring Boot JAR ==='
        dir('backend') {
          sh 'mvn clean package -DskipTests -B'
          sh 'ls -lh target/*.jar'
        }
      }
    }
 
    // ── STAGE 4: BUILD FRONTEND ───────────────────────────────
    stage('Build Frontend') {
      steps {
        echo '=== Building Angular application ==='
        dir('frontend') {
          sh 'npm ci'              // Clean install
          sh 'npm run build'       // Vite handles production build by default
          sh 'ls -lh dist/'
        }
      }
    }
 
    // ── STAGE 5: BUILD DOCKER IMAGES ─────────────────────────
    stage('Build Docker Images') {
      steps {
        echo '=== Building Docker images ==='
        script {
          // Build backend image:
          dir('backend') {
            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ."
            sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest"
          }
          // Build frontend image:
          dir('frontend') {
            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
            sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest"
          }
        }
      }
    }
 
    // ── STAGE 6: PUSH TO ECR ─────────────────────────────────
    stage('Push to ECR') {
      steps {
        echo '=== Pushing images to Amazon ECR ==='
        script {
          // Login to ECR using AWS CLI:
          sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
          
          // Push both tags (build number + latest):
          sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
          sh "docker push ${BACKEND_IMAGE}:latest"
          sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
          sh "docker push ${FRONTEND_IMAGE}:latest"
        }
      }
    }
 
    // ── STAGE 7: DEPLOY TO KUBERNETES ────────────────────────
    stage('Deploy to Kubernetes') {
      steps {
        echo '=== Deploying to EKS cluster ==='
        script {
          sh "aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}"
          
          // Update images with new build number tag:
          sh "kubectl set image deployment/auth-backend backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n ${K8S_NAMESPACE}"
          sh "kubectl set image deployment/auth-frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n ${K8S_NAMESPACE}"
        }
      }
    }
 
    // ── STAGE 8: VERIFY DEPLOYMENT ───────────────────────────
    stage('Verify Deployment') {
      steps {
        echo '=== Verifying deployment ==='
        script {
          sh "kubectl rollout status deployment/backend -n ${K8S_NAMESPACE} --timeout=300s"
          sh "kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=300s"
          sh "kubectl get pods -n ${K8S_NAMESPACE}"
        }
      }
    }
  }
 
  // Run after all stages (success or failure):
  post {
    success {
      echo '✅ Deployment SUCCESSFUL!'
      // Send Slack/email notification here
    }
    failure {
      echo '❌ Deployment FAILED!'
      // Roll back if needed:
      // sh 'kubectl rollout undo deployment/backend -n login-app'
    }
    always {
      // Clean up Docker images from Jenkins server (save disk space):
      // '|| true' prevents post-stage failure if Docker is unavailable:
      sh 'docker system prune -f || true'
    }
  }
}
