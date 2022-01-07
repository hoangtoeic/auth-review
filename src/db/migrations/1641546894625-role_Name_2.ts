import {MigrationInterface, QueryRunner} from "typeorm";

export class roleName21641546894625 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Role" (name)
            VALUES ('USER')
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "Role"
            WHERE name = 'USER'
        `)
    }

}
