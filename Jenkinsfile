pipeline {
    agent any

    triggers {
        pollSCM('*/3 * * * *')
    }

    environment {
        AWS_ACCESS_KEY_ID = credentials('awsAccessKeyId')
        AWS_SECRET_ACCESS_KEY = credentials('awsSecretAccessKey')
        AWS_DEFAULT_REGION = credentials('ap-northeast-1')
        HOME = '.' // Avoid npm root owned
    }

    stages {
        // 레포지토리를 다운로드 받음
        stage('Prepare') {
            agent any

            steps {
                echo "Lets start Long Journey !"
                echo "Clonning Repository"

                git url: 'https://github.com/jonsoku2/jenkinstest.git',
                    branch: 'master',
                    credentialsId: 'gittest'

            }


            post {
            // If Maven was able to run the tests, even if some of the test
            // failed, record the test results and archive the jar file.Deploy
                success {
                    echo 'Successfully Cloned Repository'
                }

                always {
                    echo "I tried..."
                }

                cleanup {
                    echo "after all other post condition"
                }
            }
        }
//         stage('Only for production') {
//             when {
//                 branch 'production'
//                 environment name: 'APP_ENV', value: 'prod'
//                 anyOf {
//                     environment name: 'DEPLOY_TO', value: 'production'
//                     environment name: 'DEPLOY_TO', value: 'staging'
//                 }
//             }
//         }

        // aws s3 에 파일을 올림
        stage('Deploy Frontend') {
            steps {
                echo 'Deploying Frontend'
                // 프론트엔드 디렉토리의 정적파일들을 s3 에 올림, 이전에 반드시 EC2 instance profile 을 등록해야함.
                dir ('./website') {
                    sh '''
                    aws s3 sync ./ s3://jonsokubucket
                    '''
                }

            }

            post {
                success {
                    echo 'Successfully Cloned Repository'

                    mail to: 'the2792@gmail.com'
                         subject: 'Deploy Frontend Success'
                         body: "Successfully deployed frontend!"
                }
                failure {
                    echo 'I failed :('

                    mail to: 'the2792@gmail.com'
                         subject: 'Failed Pipeline'
                         body: "Something is wron with deploy frontend"
                }
            }
        }

        stage('Lint Backend') {
            // Docker plugin and Docker Pipeline 두개를 깔아야 사용 가능 ! 서버에서 직접설치
            agent {
                docker {
                    image 'node:latest'
                }
            }

            steps {
                dir ('./server') {
                    sh '''
                    npm install && npm run lint
                    '''
                }
            }
        }
//         stage('Test Backend') {}
        stage('Build Backend') {
            agent any
            steps {
                echo 'Build Backend'

                dir ('./server') {
                    sh '''
                    docker build . -t server --build-arg env=${PROD}
                    '''
                }
            }

            post {
                failure {
                    error 'This pipeline stops here...'
                }
            }
        }
        stage('Deploy Backend') {
            agent any

            steps {
                echo 'Build Backend'

                dir('./server') {
                    sh '''
                    docker rm -f $(docker ps -aq)
                    docker run -p 80:80 -d server
                    '''
                }
            }

            post {
                success {
                    mail to: 'the2792@gmail.com'
                         subject: 'Deploy success'
                         body: "Successfully deployed!"
                }
            }
        }
    }
}