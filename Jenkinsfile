pipeline {
    agent { label 'docker' }
    stages {
        stage('Build') {
            steps {
                withDockerRegistry([credentialsId: 'fintlabsacr.azurecr.io', url: 'https://fintlabsacr.azurecr.io']) {
                    sh "docker build --tag ${GIT_COMMIT} ."
                }
            }
        }
        stage('Publish') {
            when { branch 'main' }
            steps {
                withDockerRegistry([credentialsId: 'fintlabsacr.azurecr.io', url: 'https://fintlabsacr.azurecr.io']) {
                    sh "docker tag ${GIT_COMMIT} fintlabsacr.azurecr.io/unleash:build.${BUILD_NUMBER}"
                    sh "docker push fintlabsacr.azurecr.io/unleash:build.${BUILD_NUMBER}"
                }
            }
        }
        stage('Publish PR') {
            when { changeRequest() }
            steps {
                withDockerRegistry([credentialsId: 'fintlabsacr.azurecr.io', url: 'https://fintlabsacr.azurecr.io']) {
                    sh "docker tag ${GIT_COMMIT} fintlabsacr.azurecr.io/unleash:${BRANCH_NAME}.${BUILD_NUMBER}"
                    sh "docker push fintlabsacr.azurecr.io/unleash:${BRANCH_NAME}.${BUILD_NUMBER}"
                }
            }
        }
        stage('Publish Version') {
            when {
                tag pattern: "v\\d+\\.\\d+\\.\\d+(-\\w+-\\d+)?", comparator: "REGEXP"
            }
            steps {
                script {
                    VERSION = TAG_NAME[1..-1]
                }
                sh "docker tag ${GIT_COMMIT} fintlabsacr.azurecr.io/unleash:${VERSION}"
                withDockerRegistry([credentialsId: 'fintlabsacr.azurecr.io', url: 'https://fintlabsacr.azurecr.io']) {
                    sh "docker push fintlabsacr.azurecr.io/unleash:${VERSION}"
                }
            }
        }
    }
}
