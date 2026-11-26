// 연결: Query.listScores  |  데이터 소스: ScoreTable  |  런타임: APPSYNC_JS
// board = "RANK" 파티션 전체를 Query → 점수순 정렬·TOP 10은 프론트엔드에서
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Query',
    query: {
      expression: '#board = :board',
      expressionNames: { '#board': 'board' },
      expressionValues: util.dynamodb.toMapValues({ ':board': 'RANK' }),
    },
    limit: ctx.args.limit || 1000,
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return { items: ctx.result.items };
}
