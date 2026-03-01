import product from './product'
import category from './category'
import order from './order'
import customer from './customer'
import inventoryMovement from './inventoryMovement'
import supplier from './supplier'
import systemLog from './systemLog'

export const schema = {
    types: [
        product,
        category,
        order,
        customer,
        inventoryMovement,
        supplier,
        systemLog,
    ]
}
