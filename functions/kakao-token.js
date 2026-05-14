export async function onRequestPost(context) {
  const body = await context.request.text();

  const kakaoRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  });

  const data = await kakaoRes.text();

  return new Response(data, {
    status: kakaoRes.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://vi7al.com',
    },
  });
}
