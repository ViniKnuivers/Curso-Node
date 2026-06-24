export async function up(knex) {
    // CRIA a tabela transactions do zero
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary();
        table.text('title').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
export async function down(knex) {
    await knex.schema.dropTable('transactions');
}
//# sourceMappingURL=20260622135431_create-documents.js.map