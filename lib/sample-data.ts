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
