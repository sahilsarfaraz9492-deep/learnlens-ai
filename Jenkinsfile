pipeline {
    agent any

    environment {
        APP_SERVER = 'ubuntu@52.3.236.206'
        AWS_REGION = 'us-east-1'
        EKS_CLUSTER = 'learnlens-eks-cluster'
        APP_URL = 'http://a1da2e40e1dd04f41b199273ecc88919-101461696.us-east-1.elb.amazonaws.com'
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
                        ansible app_servers -m ping
                    '''
                }
            }
        }

        stage('Ansible Configuration') {
            steps {
                sshagent(credentials: ['learnlens-deploy-key']) {
                    sh '''
                        set -e
                        cd ansible
                        export ANSIBLE_HOST_KEY_CHECKING=False
                        ansible-playbook playbooks/site.yml
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['learnlens-deploy-key']) {
                    sh '''
                        set -e
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

        stage('Deploy to Amazon EKS') {
            steps {
                sh '''
                    set -e

                    echo "===== CONFIGURE EKS ACCESS ====="

                    aws eks update-kubeconfig \
                        --region "$AWS_REGION" \
                        --name "$EKS_CLUSTER"

                    echo "===== VERIFY EKS NODES ====="
                    kubectl get nodes

                    echo "===== APPLY KUBERNETES MANIFESTS ====="
                    kubectl apply -f k8s/

                    echo "===== WAIT FOR DEPLOYMENTS ====="

                    kubectl rollout status deployment/backend \
                        -n learnlens --timeout=180s

                    kubectl rollout status deployment/frontend \
                        -n learnlens --timeout=180s

                    kubectl rollout status deployment/postgres \
                        -n learnlens --timeout=180s

                    kubectl rollout status deployment/redis \
                        -n learnlens --timeout=180s

                    echo "===== VERIFY PODS ====="
                    kubectl get pods -n learnlens

                    echo "===== VERIFY SERVICES ====="
                    kubectl get services -n learnlens

                    echo "===== APPLICATION HEALTH CHECK ====="

                    for i in $(seq 1 12); do
                        if curl -fsS "$APP_URL/api/health"; then
                            echo
                            echo "EKS application health check passed"
                            exit 0
                        fi
                        sleep 10
                    done

                    echo "EKS application health check failed"
                    exit 1
                '''
            }
        }
    }
}
