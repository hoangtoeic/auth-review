import {MigrationInterface, QueryRunner} from "typeorm";

export class remove2Column1641353769419 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('User', 'refreshtoken');
        await queryRunner.dropColumn('User', 'refreshtokenexpires');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE "User"
         ADD COLUMN refreshtoken VARCHAR(20) NOT NULL DEFAULT('111')`)
         await queryRunner.query(
       ` ALTER TABLE "User"
         ADD COLUMN refreshtokenexpires VARCHAR(20) NOT NULL DEFAULT('222')`)
    }

}
