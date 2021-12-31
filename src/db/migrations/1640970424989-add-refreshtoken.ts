import { table } from "console";
import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addRefreshtoken1640970424989 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.addColumn("User", new TableColumn({
        //     name: "refreshtoken",
        //     type: "character varying"
        // }));
        // await queryRunner.addColumn("User", new TableColumn({
        //     name: "refreshtokenexpires",
        //     type: "character varying"
        // }));
        
        await queryRunner.query(`
        ALTER TABLE "User"
         ADD COLUMN refreshtoken VARCHAR(20) NOT NULL DEFAULT('111')`)
         await queryRunner.query(
       ` ALTER TABLE "User"
         ADD COLUMN refreshtokenexpires VARCHAR(20) NOT NULL DEFAULT('222')`)


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("User", "refreshtoken");
        await queryRunner.dropColumn("User", "refreshtokenexpires");

    }

}
