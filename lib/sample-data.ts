export const SAMPLE_PLAN = `Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create
  ~ update in-place
  - destroy

Terraform will perform the following actions:

  # azurerm_lb.test will be updated in-place
  ~ resource "azurerm_lb" "test" {
      id = "/subscriptions/test-id"
      ~ load_balancer_rules = [
        - "/subscriptions/test-id/resourceGroups/example/providers/Microsoft.Network/loadBalancers/testloadbalancer/loadBalancingRules/rule1",
        - "/subscriptions/test-id/resourceGroups/example/providers/Microsoft.Network/loadBalancers/testloadbalancer/loadBalancingRules/rule2",
      ] -> (known after apply)
    }

  # azurerm_resource_group.example will be created
  + resource "azurerm_resource_group" "example" {
      + id       = (known after apply)
      + location = "West Europe"
      + name     = "example-resources"
    }

  # azurerm_storage_account.old will be destroyed
  - resource "azurerm_storage_account" "old" {
      - account_kind             = "StorageV2"
      - account_replication_type = "LRS"
      - account_tier             = "Standard"
      - id                       = "/subscriptions/test-id/resourceGroups/example/providers/Microsoft.Storage/storageAccounts/oldaccount"
      - location                 = "West Europe"
      - name                     = "oldaccount"
    }

  # azurerm_virtual_machine.example must be replaced
  -/+ resource "azurerm_virtual_machine" "example" {
      ~ id               = "/subscriptions/test-id/resourceGroups/example/providers/Microsoft.Compute/virtualMachines/example-vm" -> (known after apply)
      ~ name             = "old-vm-name" -> "new-vm-name" # forces replacement
        location         = "West Europe"
    }

Plan: 1 to add, 1 to change, 1 to destroy, 1 to replace.`

export const SAMPLE_NSG_PLAN = `Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  ~ update in-place

Terraform will perform the following actions:

  # azurerm_network_security_group.VNET-PROD-NSG will be updated in-place
  ~ resource "azurerm_network_security_group" "VNET-PROD-NSG" {
        id                  = "/subscriptions/1234-5678/resourceGroups/VNET-RG/providers/Microsoft.Network/networkSecurityGroups/VNET-PROD-NSG"
        name                = "VNET-PROD-NSG"
      ~ security_rule       = [
          - {
              - access                                     = "Allow"
              - destination_address_prefix                 = "*"
              - destination_address_prefixes               = []
              - destination_application_security_group_ids = []
              - destination_port_range                     = "3389"
              - destination_port_ranges                    = []
              - direction                                  = "Inbound"
              - name                                       = "RDP-VNET-NSG-RULE"
              - priority                                   = 100
              - protocol                                   = "Tcp"
              - source_address_prefix                      = "VirtualNetwork"
              - source_address_prefixes                    = []
              - source_application_security_group_ids      = []
              - source_port_range                          = "*"
              - source_port_ranges                         = []
            },
          - {
              - access                                     = "Allow"
              - destination_address_prefixes               = [
                  - "10.11.0.70",
                ]
              - destination_application_security_group_ids = []
              - destination_port_ranges                    = [
                  - "1645",
                  - "1646",
                  - "1812",
                  - "1813",
                ]
              - direction                                  = "Inbound"
              - name                                       = "RADIUS-NSG-RULE"
              - priority                                   = 111
              - protocol                                   = "*"
              - source_address_prefixes                    = [
                  - "10.130.8.0/23",
                  - "172.16.0.0/16",
                  - "192.168.0.0/16",
                ]
              - source_application_security_group_ids      = []
              - source_port_range                          = "*"
              - source_port_ranges                         = []
            },
          - {
              - access                                     = "Deny"
              - destination_address_prefix                 = "*"
              - destination_address_prefixes               = []
              - destination_application_security_group_ids = []
              - destination_port_range                     = "*"
              - destination_port_ranges                    = []
              - direction                                  = "Inbound"
              - name                                       = "DenyAllIn-NSG-RULE"
              - priority                                   = 4096
              - protocol                                   = "*"
              - source_address_prefix                      = "*"
              - source_address_prefixes                    = []
              - source_application_security_group_ids      = []
              - source_port_range                          = "*"
              - source_port_ranges                         = []
            },
          + {
              + access                                     = "Allow"
              + destination_address_prefix                 = "*"
              + destination_address_prefixes               = []
              + destination_application_security_group_ids = []
              + destination_port_range                     = "3389"
              + destination_port_ranges                    = []
              + direction                                  = "Inbound"
              + name                                       = "RDP-VNET-NSG-RULE"
              + priority                                   = 100
              + protocol                                   = "Tcp"
              + source_address_prefix                      = "VirtualNetwork"
              + source_address_prefixes                    = []
              + source_application_security_group_ids      = []
              + source_port_range                          = "*"
              + source_port_ranges                         = []
            },
          + {
              + access                                     = "Allow"
              + destination_address_prefixes               = [
                  + "10.11.0.70",
                ]
              + destination_application_security_group_ids = []
              + destination_port_ranges                    = [
                  + "1645",
                  + "1646",
                  + "1812",
                  + "1813",
                ]
              + direction                                  = "Inbound"
              + name                                       = "RADIUS-NSG-RULE"
              + priority                                   = 111
              + protocol                                   = "*"
              + source_address_prefixes                    = [
                  + "10.130.8.0/23",
                  + "10.131.8.0/23",
                  + "172.16.0.0/16",
                  + "192.168.0.0/16",
                ]
              + source_application_security_group_ids      = []
              + source_port_range                          = "*"
              + source_port_ranges                         = []
            },
          + {
              + access                                     = "Allow"
              + destination_address_prefix                 = "*"
              + destination_address_prefixes               = []
              + destination_application_security_group_ids = []
              + destination_port_range                     = "22"
              + destination_port_ranges                    = []
              + direction                                  = "Inbound"
              + name                                       = "SSH-NEW-NSG-RULE"
              + priority                                   = 105
              + protocol                                   = "Tcp"
              + source_address_prefix                      = "10.0.0.0/8"
              + source_address_prefixes                    = []
              + source_application_security_group_ids      = []
              + source_port_range                          = "*"
              + source_port_ranges                         = []
            },
          + {
              + access                                     = "Deny"
              + destination_address_prefix                 = "*"
              + destination_address_prefixes               = []
              + destination_application_security_group_ids = []
              + destination_port_range                     = "*"
              + destination_port_ranges                    = []
              + direction                                  = "Inbound"
              + name                                       = "DenyAllIn-NSG-RULE"
              + priority                                   = 4096
              + protocol                                   = "*"
              + source_address_prefix                      = "*"
              + source_address_prefixes                    = []
              + source_application_security_group_ids      = []
              + source_port_range                          = "*"
              + source_port_ranges                         = []
            },
        ]
        tags                = {}
    }

Plan: 0 to add, 1 to change, 0 to destroy.`
