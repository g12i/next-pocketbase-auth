# next-pocketbase-auth

A lightweight authentication wrapper for Next.js applications using PocketBase, providing easy-to-use utilities for handling user session in both client and server components.

## Installation

```bash
npm install next-pocketbase-auth
```

## Security Considerations

Don't rely solely on `pb.authStore.record` inside server code such as middleware. It isn't guaranteed to revalidate the Auth token.

Always use `await pb.collection("users").authRefresh();` to protect pages and user data.

Use following code to safely obtain information about the current user:

```ts
const pb = createServerClient(await cookies());

const { record: user } = await pb.collection("users").authRefresh();
```

## Setup Guide

### 1. Environment Variables

Add your PocketBase URL to your environment variables:

```
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090/api/
```

### 2. Initialize PocketBase Clients

You'll need two different clients for client-side and server-side operations:

#### Client Component

For Client Components:

```ts
import { createBrowserClient } from "next-pocketbase-auth";

const pb = createBrowserClient();
```

`createBrowserClient` uses a singleton pattern, so you only ever create one instance, no matter how many times you call your createClient function.

#### Server Components

For Server Components, Server Actions, and Route Handlers::

```ts
import { createServerClient } from "next-pocketbase-auth";
import { cookies } from "next/headers";

const pb = createServerClient(await cookies());
```

### 3. Configure Middleware

The middleware is essential for maintaining authentication state across your application.

It handles:

- Automatic token refresh
- Cookie management
- Authentication state persistence

Create a `middleware.ts` file in your project root (or in the `src/` folder if that's where your code is).

```ts
// middleware.ts

import { createServerClient } from "next-pocketbase-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const pb = createServerClient({
    get: (name) => request.cookies.get(name),
    set: (name, value, opts) => {
      request.cookies.set(name, value);
      response.cookies.set(name, value, opts);
    },
    delete: (name) => {
      request.cookies.delete(name);
      response.cookies.delete(name);
    },
  });

  // If we have a valid token, refresh the token
  try {
    if (pb.authStore.isValid) await pb.collection("users").authRefresh();
  } catch {
    // If we can't refresh the token, clear the cookies
    pb.authStore.clear();
  }

  // If we have a user, continue
  if (pb.authStore.record) return response;

  // If we are already on the login page, continue
  if (request.nextUrl.pathname === "/login") return response;

  // Redirect to the login page
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

### 4. Login Page

You can uses regular PocketBase's SDK authentication functions [see here](https://pocketbase.io/docs/authentication/), as long as you:

- create the client with `createBrowserClient()` function
- refresh the page (or redirect) once the authentication is finished

For example to login with GitHub:

```tsx
export function LoginForm(): React.ReactElement {
  const [submitError, setSubmitError] = useState<string>("");
  const router = useRouter();

  const handleGitHubLogin = async () => {
    try {
      setSubmitError("");

      await pb.collection("users").authWithOAuth2({ provider: "github" });

      router.push("/");
    } catch {
      setSubmitError("An unexpected error occurred");
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGitHubLogin}>
      <GitHubLogoIcon className="mr-2" />
      Login with GitHub
    </Button>
  );
}
```

### 5. Access user info from Server Components

```tsx
import { to } from "await-to-js";
import { createServerClient } from "next-pocketbase-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const pb = createServerClient(await cookies());
  const [error, result] = await to(pb.collection("users").authRefresh());

  if (error) {
    redirect("/login");
  }

  return <p>Hello {result.record.name}</p>;
}
```

## Common Patterns

### Mixed Public/Private Routes

For applications with both public and protected routes the middleware can stop at refreshing the auth token if it's present:

```ts
// middleware.ts

import { createServerClient } from "next-pocketbase-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const pb = createServerClient({
    get: (name) => request.cookies.get(name),
    set: (name, value, opts) => {
      request.cookies.set(name, value);
      response.cookies.set(name, value, opts);
    },
    delete: (name) => {
      request.cookies.delete(name);
      response.cookies.delete(name);
    },
  });

  // If we have a valid token, refresh the token
  try {
    if (pb.authStore.isValid) await pb.collection("users").authRefresh();
  } catch {
    // If we can't refresh the token, clear the cookies
    pb.authStore.clear();
  }

  return response;
}
```

### Using with TypeScript

Add type safety using [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) package.

Use it as:

```ts
import { createServerClient, createBrowserClient } from "next-pocketbase-auth";
import { TypedPocketBase } from "./lib/pb.generated";

const pb = createServerClient<TypedPocketBase>();
const pb2 = createBrowserClient<TypedPocketBase>();
```

### API

#### `createBrowserClient<T extends PocketBase = PocketBase>(baseUrl?: string, lang?: string, cookieOptions?: CookieOptions): T`

Creates a PocketBase client instance for use in client components.

**Parameters:**

- `baseUrl` - (optional) PocketBase API URL (defaults to `process.env.NEXT_PUBLIC_PB_URL` or `http://127.0.0.1:8090/api/`)
- `lang` - (optional) language code passed to PocketBase client
- `cookieOptions` - (optional) options to set cookies (see below)

**Returns:**

- PocketBase client instance

#### `createServerClient<T extends PocketBase = PocketBase>(cookies: CookiesAdapter, baseUrl?: string, lang?: string, cookieOptions?: CookieOptions): T`

Creates a PocketBase client instance for use in server components.

**Parameters:**

- `cookies` - **required** server cookies (see examples)
- `baseUrl` - (optional) PocketBase API URL (defaults to `process.env.NEXT_PUBLIC_PB_URL` or `http://127.0.0.1:8090/api/`)
- `lang` - (optional) language code passed to PocketBase client
- `cookieOptions` - (optional) options to set cookies (see below)

**Returns:**

- PocketBase client instance

##### `CookieOptions`

By default the cookie is set with following settings:

```ts
export const defaultCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  expires: new Date(Date.now() + 86400), // will be set to the token expiration date, this is safe default of 24 hours
};
```
