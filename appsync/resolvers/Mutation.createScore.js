// 연결: Mutation.createScore  |  데이터 소스: ScoreTable  |  런타임: APPSYNC_JS
// 테이블 키: board(파티션 키, 항상 "RANK") + sk(정렬 키, "등록시각#id")
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { nickname, score, title } = ctx.args.input;
  const nick = nickname.trim();
  if (!nick) util.error('닉네임은 필수입니다.', 'ValidationError');
  if (nick.length > 12) util.error('닉네임은 12자 이하로 입력해 주세요.', 'ValidationError');
  if (score < 0 || score > 10) util.error('점수는 0~10 사이여야 합니다.', 'ValidationError');

  const id = util.autoId();
  const createdAt = util.time.nowISO8601();
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ board: 'RANK', sk: `${createdAt}#${id}` }),
    attributeValues: util.dynamodb.toMapValues({ id, nickname: nick, score, title, createdAt }),
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return ctx.result;
}
