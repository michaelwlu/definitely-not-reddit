"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const User_1 = require("../entities/User");
exports.createUserLoader = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.User.findByIds(userIds);
    const userIdToUser = {};
    users.forEach((u) => {
        userIdToUser[u.id] = u;
    });
    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    return sortedUsers;
}));
//# sourceMappingURL=createUserLoader.js.map