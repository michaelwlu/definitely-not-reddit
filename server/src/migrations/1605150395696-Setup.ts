import {MigrationInterface, QueryRunner} from "typeorm";

export class Setup1605150395696 implements MigrationInterface {
    name = 'Setup1605150395696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "link" ("linkId" SERIAL NOT NULL, "linkText" character varying NOT NULL, "url" character varying NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "domain" character varying NOT NULL, "image" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7b6029b623ae87018daf980a2df" PRIMARY KEY ("linkId"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD "postLinkId" integer`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "UQ_f68fa831d8270ea3f35e5bcb3c0" UNIQUE ("postLinkId")`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_f68fa831d8270ea3f35e5bcb3c0" FOREIGN KEY ("postLinkId") REFERENCES "link"("linkId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_f68fa831d8270ea3f35e5bcb3c0"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "UQ_f68fa831d8270ea3f35e5bcb3c0"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "postLinkId"`);
        await queryRunner.query(`DROP TABLE "link"`);
    }

}
