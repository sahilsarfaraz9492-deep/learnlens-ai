pipeline {
    agent any

    environment {
        APP_SERVER = 'ubuntu@52.3.236.206'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Ansible Connectivity Test') {
            steps {
                sshagent(credentials: ['learnlens-deploy-key']) {
                    sh '''
                        set -e
                        cd ansible

                        export ANSIBLE_HOST_KEY_CHECKING=False

                        echo "Testing Ansible connectivity..."
                        ansible app_servers -m ping

                        echo "Ansible connectivity successful"
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['learnlens-deploy-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "$APP_SERVER" '
                                set -e
                                cd /home/ubuntu/learnlens-ai

                                git pull --ff-only origin main

                                docker compose config -q
                                docker compose build
                                docker compose up -d

                                docker compose ps

                                for i in $(seq 1 20); do
                                    if curl -fsS http://localhost/api/health >/dev/null; then
                                        echo "Application health check passed"
                                        exit 0
                                    fi
                                    sleep 5
                                done

                                echo "Application health check failed"
                                exit 1
                            '
                    '''
                }
            }
        }
    }
}
