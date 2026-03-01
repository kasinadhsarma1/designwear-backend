import { StructureBuilder } from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
    S.list()
        .title('Content')
        .items([
            S.listItem()
                .title('Products')
                .child(
                    S.list()
                        .title('Product Management')
                        .items([
                            S.listItem()
                                .title('All Products')
                                .child(S.documentTypeList('product').title('All Products')),
                            S.listItem()
                                .title('Active Products')
                                .child(
                                    S.documentTypeList('product')
                                        .title('Active Products')
                                        .filter('_type == "product" && status == "active"')
                                ),
                            S.listItem()
                                .title('Out of Stock')
                                .child(
                                    S.documentTypeList('product')
                                        .title('Out of Stock')
                                        .filter('_type == "product" && stock <= 0')
                                ),
                        ])
                ),
            S.divider(),
            S.documentTypeListItem('category').title('Categories'),
            S.documentTypeListItem('order').title('Orders'),
            S.documentTypeListItem('customer').title('Customers'),
            S.divider(),
            S.listItem()
                .title('Inventory')
                .child(
                    S.list()
                        .title('Inventory Management')
                        .items([
                            S.documentTypeListItem('inventoryMovement').title('Stock Movements'),
                            S.documentTypeListItem('supplier').title('Suppliers'),
                        ])
                ),
            S.divider(),
            S.documentTypeListItem('systemLog').title('System Logs'),
        ])
