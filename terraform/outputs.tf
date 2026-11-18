output "vpc_id" {
  description = "LearnLens AI VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id
  ]
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]
}

output "availability_zones" {
  description = "Selected Availability Zones"
  value       = local.availability_zones
}


output "app_instance_id" {
  description = "LearnLens AI EC2 instance ID"
  value       = aws_instance.app.id
}

output "app_public_ip" {
  description = "LearnLens AI EC2 public IP"
  value       = aws_instance.app.public_ip
}

output "app_public_dns" {
  description = "LearnLens AI EC2 public DNS"
  value       = aws_instance.app.public_dns
}
