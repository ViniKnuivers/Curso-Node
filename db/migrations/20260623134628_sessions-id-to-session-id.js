export async function up(knex) {
    // ALTERA a tabela que já foi criada no arquivo anterior
    await knex.schema.alterTable('transactions', (table) => {
        table.uuid('session_id').after('id').index();
    });
}
export async function down(knex) {
    await knex.schema.alterTable('transactions', (table) => {
        table.dropColumn('session_id');
    });
}
//# sourceMappingURL=20260623134628_sessions-id-to-session-id.js.map