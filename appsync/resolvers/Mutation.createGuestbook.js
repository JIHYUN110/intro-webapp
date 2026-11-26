// 연결: Mutation.createGuestbook  |  데이터 소스: GuestbookTable  |  런타임: APPSYNC_JS
// 테이블 키: board(파티션 키, 항상 "GUESTBOOK") + sk(정렬 키, "등록시각#id")
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { nickname, message, sticker } = ctx.args.input;
  const nick = nickname.trim();
  const msg = message.trim();
  if (!nick) util.error('닉네임은 필수입니다.', 'ValidationError');
  if (!msg) util.error('메시지는 필수입니다.', 'ValidationError');
  if (nick.length > 12) util.error('닉네임은 12자 이하로 입력해 주세요.', 'ValidationError');
  if (msg.length > 200) util.error('메시지는 200자 이하로 입력해 주세요.', 'ValidationError');

  const id = util.autoId();
  const createdAt = util.time.nowISO8601();
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ board: 'GUESTBOOK', sk: `${createdAt}#${id}` }),
    attributeValues: util.dynamodb.toMapValues({ id, nickname: nick, message: msg, sticker, createdAt }),
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return ctx.result;
}
