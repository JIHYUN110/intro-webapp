// 연결: Query.listQuestions  |  데이터 소스: QuestionTable  |  런타임: APPSYNC_JS
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  // 문제는 10개뿐이라 Scan 한 번으로 전부 가져옴 (순서 섞기는 프론트엔드에서)
  return { operation: 'Scan', limit: 100 };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return { items: ctx.result.items };
}
