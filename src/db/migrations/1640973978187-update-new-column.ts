import {MigrationInterface, QueryRunner} from "typeorm";

export class updateNewColumn1640973978187 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
             
        await queryRunner.query(`
        ALTER TABLE "User"
         ADD COLUMN refreshtoken VARCHAR(50) NOT NULL DEFAULT('111')`)
         await queryRunner.query(
       ` ALTER TABLE "User"
         ADD COLUMN refreshtokenexpires VARCHAR(50) NOT NULL DEFAULT('222')`)


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("User", "refreshtoken");
        await queryRunner.dropColumn("User", "refreshtokenexpires");
    }

}
