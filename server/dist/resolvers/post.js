"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const isAuth_1 = require("../middleware/isAuth");
const Upvote_1 = require("../entities/Upvote");
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_1.Field(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    vote(postId, input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = input !== -1 ? 1 : -1;
            const { userId } = req.session;
            const upvote = yield Upvote_1.Upvote.findOne({ where: { postId, userId } });
            if (upvote) {
                if (upvote.value !== value) {
                    yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.query(`UPDATE upvote
					SET value = $1
					WHERE "postId" = $2 AND "userId" = $3
					`, [value, postId, userId]);
                        yield tm.query(`
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`, [2 * value, postId]);
                    }));
                }
                else if (upvote.value === value) {
                    yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.query(`DELETE FROM upvote
					WHERE "postId" = $1 AND "userId" = $2
					`, [postId, userId]);
                        yield tm.query(`
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`, [-value, postId]);
                    }));
                }
            }
            else if (!upvote) {
                yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
					INSERT INTO upvote ("userId", "postId", value)
					VALUES ($1, $2, $3)
				`, [userId, postId, value]);
                    yield tm.query(`
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`, [value, postId]);
                }));
            }
            return true;
        });
    }
    posts(limit, cursor, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const validLimit = Math.min(50, limit);
            const validLimitPlus = validLimit + 1;
            const replacements = [validLimitPlus];
            if (req.session.userId) {
                replacements.push(req.session.userId);
            }
            let cursorIdx = 3;
            if (cursor) {
                replacements.push(new Date(Number(cursor)));
                cursorIdx = replacements.length;
            }
            const posts = yield typeorm_1.getConnection().query(`
			SELECT p.*,
			json_build_object(
				'id', u.id,
				'username', u.username,
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt"
				) creator,
			${req.session.userId
                ? '(SELECT value FROM upvote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
                : 'null as "voteStatus"'}
			FROM post AS p
			INNER JOIN public.user AS u ON  u.id = p."creatorId"
			${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
			`, replacements);
            return {
                posts: posts.slice(0, validLimit),
                hasMore: posts.length === validLimitPlus,
            };
        });
    }
    post(id) {
        return Post_1.Post.findOne(id);
    }
    createPost(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        });
    }
    updatePost(id, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne(id);
            if (!post)
                return null;
            if (typeof title !== 'undefined') {
                Post_1.Post.update({ id }, { title });
            }
            return post;
        });
    }
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Post_1.Post.delete(id);
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('input', () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg('id')),
    __param(1, type_graphql_1.Arg('title', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map