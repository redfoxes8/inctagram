def app

pipeline {
    agent any
    environment {
        ENV_TYPE = "production"
        PORT = 4283
        NAMESPACE = "nymbi-org"
        REGISTRY_HOSTNAME = "oshknay"
        REGISTRY = "registry.hub.docker.com"
        PROJECT = "inctagram"
        DEPLOYMENT_NAME = "inctagram-deployment"
        IMAGE_NAME = "${env.BUILD_ID}_${env.ENV_TYPE}_${env.GIT_COMMIT}"
        DOCKER_BUILD_NAME = "${env.REGISTRY_HOSTNAME}/${env.PROJECT}:${env.IMAGE_NAME}"

         API_BASE_URL = 'http://main-gateway-service.nymbi.svc.cluster.local:4283' 
        NEXT_PUBLIC_BASE_URL =  'https://main-gateway-service.nymbi.org'
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY = '6LdmQs0sAAAAAFK-o8fm8A3o4N_RGLgS505TqxEfy'

        
    }

    stages {
        stage('Clone repository') {
            steps {
                checkout scm
            }
        }

       stage('Build docker image') {
            steps {
                echo "Build image started..."
                script {
                        def dockerBuildArgs = "--build-arg API_BASE_URL=${env.API_BASE_URL} --build-arg NEXT_PUBLIC_BASE_URL=${env.NEXT_PUBLIC_BASE_URL} --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} --build-arg NODE_TLS_REJECT_UNAUTHORIZED=0 ."
            app = docker.build("${env.DOCKER_BUILD_NAME}", dockerBuildArgs)
                }
                echo "Build image finished..."
            }
        }
        
        stage('Push docker image') {
             steps {
                 echo "Push image started..."
                     script {
                          docker.withRegistry("https://${env.REGISTRY}", 'nymbi-org') {
                            app.push("${env.IMAGE_NAME}")
                        }
                     }
                 echo "Push image finished..."
             }
       }
       stage('Delete image local') {
             steps {
                 script {
                    sh "docker rmi -f ${env.DOCKER_BUILD_NAME}"
                 }
             }
        }
        stage('Preparing deployment') {
             steps {
                 echo "Preparing started..."
                     sh 'ls -ltr'
                     sh 'pwd'
                     sh "chmod +x preparingDeploy.sh"
                     sh "./preparingDeploy.sh ${env.REGISTRY_HOSTNAME} ${env.PROJECT} ${env.IMAGE_NAME} ${env.DEPLOYMENT_NAME} ${env.PORT} ${env.NAMESPACE}"
                     sh "cat deployment.yaml"
             }

        }
        stage('Deploy to Kubernetes') {
             steps {
                 withKubeConfig([credentialsId: 'prod-kubernetes']) {
                    sh 'kubectl apply -f deployment.yaml'
                    sh "kubectl rollout status deployment/${env.DEPLOYMENT_NAME} --namespace=${env.NAMESPACE}"
                    sh "kubectl get services -o wide"
                 }
             }
        }
    }
}
