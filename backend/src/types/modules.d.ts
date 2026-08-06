declare module 'helmet' {
  const helmet: any;
  export default helmet;
}

declare module 'express-rate-limit' {
  const rateLimit: any;
  export default rateLimit;
}

declare module 'morgan' {
  const morgan: any;
  export default morgan;
}

declare module 'winston' {
  const winston: any;
  export default winston;
}

declare module 'uuid' {
  export const v4: () => string;
}
