// 연결: Query.listGuestbooks  |  데이터 소스: GuestbookTable  |  런타임: APPSYNC_JS
// 정렬 키(sk = 등록시각#id) 내림차순 Query → 최신순 20개를 DB에서 바로 가져옴
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const limit = Math.min(ctx.args.limit || 20, 50);
  return {
    operation: 'Query',
    query: {
      expression: '#board = :board',
      expressionNames: { '#board': 'board' },
      expressionValues: util.dynamodb.toMapValues({ ':board': 'GUESTBOOK' }),
    },
    scanIndexForward: false,
    limit,
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return { items: ctx.result.items };
}
