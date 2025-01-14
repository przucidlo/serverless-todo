resource "aws_vpc" "main" {
  cidr_block = "172.31.0.0/24"

  tags = {
    Name = "main"
  }
}

resource "aws_subnet" "main" {
  vpc_id                                      = aws_vpc.main.id
  cidr_block                                  = "172.31.0.0/24"
  map_public_ip_on_launch                     = true
  enable_resource_name_dns_a_record_on_launch = true

  tags = {
    Name = "main"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main"
  }
}

resource "aws_default_route_table" "default" {
  default_route_table_id = aws_vpc.main.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  # route {
  #   cidr_block  = var.openvpn_subnet
  #   instance_id = aws_instance.openvpn.id
  # }

  tags = {
    Name = "main"
  }

  # route {
  #   cidr_block = aws_vpc.main.cidr_block
  #   local_gateway_id = aws_
  # }
}

resource "aws_security_group" "main" {
  vpc_id = aws_vpc.main.id
  name   = "main"
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.main.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = -1
}

resource "aws_vpc_security_group_ingress_rule" "all" {
  security_group_id = aws_security_group.main.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "udp"
  from_port   = 1194
  to_port     = 1194
}

resource "aws_vpc_security_group_ingress_rule" "sg" {
  security_group_id            = aws_security_group.main.id
  referenced_security_group_id = aws_security_group.main.id
  ip_protocol                  = -1
}

