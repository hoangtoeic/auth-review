import {MigrationInterface, QueryRunner} from "typeorm";

export class roleName1641545864252 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO "Role" (name)
        VALUES('ADMIN')
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DELETE FROM  "Role"
        WHERE name = 'ADMIN'
        `)
    }

}
