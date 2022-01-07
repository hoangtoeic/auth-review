import {MigrationInterface, QueryRunner} from "typeorm";

export class FKUserUserRoleVsFKRoleUserRole1641543034148 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "UserRole"
            ADD CONSTRAINT "FK-UserRole-userId"
            FOREIGN KEY ("userId") 
            REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "UserRole"
            ADD CONSTRAINT "FK-UserRole-roleId"
            FOREIGN KEY ("roleId")
            REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "UserRole"
            DROP CONSTRAINT "FK-UserRole-roleId"
        `)

        await queryRunner.query(`
            ALTER TABLE "UserRole"
            DROP CONSTRAINT "FK-UserRole-userId"
        `)
    }

}
