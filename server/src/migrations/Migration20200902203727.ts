import { Migration } from '@mikro-orm/migrations';

export class Migration20200902203727 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email" text not null;');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
