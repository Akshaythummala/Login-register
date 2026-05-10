pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '381437929435'
        AWS_REGION = 'ap-south-1'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        CLUSTER_NAME = 'login-cluster'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Artifact') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'jenkins-aws-credentials' // Add this in Jenkins > Credentials
                ]]) {
                    script {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

                        // Backend
                        sh "docker build -t login-backend ./backend"
                        sh "docker tag login-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/login-backend:${IMAGE_TAG}"
                        sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/login-backend:${IMAGE_TAG}"

                        // Frontend
                        sh "docker build -t login-frontend ./frontend"
                        sh "docker tag login-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/login-frontend:${IMAGE_TAG}"
                        sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/login-frontend:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'jenkins-aws-credentials'
                ]]) {
                    script {
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                        sh "kubectl apply -f k8s/aws-auth.yaml"
                        sh "kubectl apply -f k8s/mysql-deployment.yaml"
                        sh "kubectl apply -f k8s/db-secret.yaml"
                        sh "kubectl apply -f k8s/service-account.yaml"
                        sh "kubectl apply -f k8s/deployment.yaml"
                        sh "kubectl rollout restart deployment auth-backend"
                        sh "kubectl rollout restart deployment auth-frontend"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
