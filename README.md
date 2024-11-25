# next-pocketbase-auth

## Getting started

### 1) Install the package

```
npm install next-pocketbase-auth
```

### 2) (Optionally) Setup environment variables

```
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090/api/
```

### 3) Use provided utility functions to initialize PocketBase

To access Supabase from your Next.js app, you need 2 types of Supabase clients.

#### Client Component client

To access Supabase from Client Components, which run in the browser.

```ts
import { createBrowserClient } from "next-pocketbase-auth";

const pb = createBrowserClient();
```

`createBrowserClient` uses a singleton pattern, so you only ever create one instance, no matter how many times you call your createClient function.

#### Server Component client

To access Supabase from Server Components, Server Actions, and Route Handlers, which run only on the server

```ts
import { createServerClient } from "next-pocketbase-auth";
import { cookies } from "next/headers";

const pb = createServerClient(await cookies());
```

### 4) Hook up middleware

Create a `middleware.ts` file at the root of your project (or `src/` directory if you use it).

Since Server Components can't write cookies, you need middleware to refresh expired Auth tokens and store them.

The middleware is responsible for:

1. Refreshing the Auth token (by calling `await pb.collection("users").authRefresh()`).
2. Passing the refreshed Auth token to Server Components, so they don't attempt to refresh the same token themselves. This is accomplished with `request.cookies.set`.
3. Passing the refreshed Auth token to the browser, so it replaces the old token. This is accomplished with `response.cookies.set`.

Copy the middleware code for your app.

Add a matcher so the middleware doesn't run on routes that don't require Authentication. See [official guide](https://nextjs.org/docs/app/building-your-application/routing/middleware).

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
  if (pb.authStore.isValid) {
    try {
      await pb.collection("users").authRefresh();
    } catch {
      // If we can't refresh the token, clear the cookies
      pb.authStore.clear();
    }
  }

  // If we have a user, continue
  if (pb.authStore.model) return response;

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

#### Heads up

Be careful when protecting pages. The server gets the token the cookies, which can be spoofed by anyone.

Always use `await pb.collection("users").authRefresh();` to protect pages and user data.

Never trust `pb.authStore.model` inside server code such as middleware. It isn't guaranteed to revalidate the Auth token.

Always use following code to obtain information about the current user.

```ts
const pb = createServerClient(await cookies());

const { record: user } = await pb.collection("users").authRefresh();
```

#### Mixed public and private data

If you use mixed public and private data your middleware can stop at refreshing the auth token if it's present:

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
  if (pb.authStore.isValid) {
    try {
      await pb.collection("users").authRefresh();
    } catch {
      // If we can't refresh the token, clear the cookies
      pb.authStore.clear();
    }
  }

  return response;
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

### 5) Create a login page

You can uses regular PocketBase's SDK authentication functions [see here](https://pocketbase.io/docs/authentication/), as long as you create client with `createBrowserClient()` and refresh the page once authentication is finished. This makes sure cookie is picked up by the server middleware.

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

### 6) Access user info from Server Components

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

### Using with TypeScript

Both `createServerClient` and `createBrowserClient` accept a generic parameter with typed PocketBase client generated by [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) package.

Use it as

```ts
import { createServerClient, createBrowserClient } from "next-pocketbase-auth";
import { TypedPocketBase } from "./lib/pb.generated";

const pb = createServerClient<TypedPocketBase>();
const pb2 = createBrowserClient<TypedPocketBase>();
```

### API

#### `createBrowserClient<T extends TypedPocketBase>(options?: ClientOptions)`

Creates a PocketBase client instance for use in browser/client components. Uses singleton pattern to ensure only one instance exists.

**Type Parameters:**
- `T` - Optional type parameter for adding TypeScript types to the PocketBase client

**Parameters:**
- `options` (optional): Configuration options
  - `url`: PocketBase API URL (defaults to `process.env.NEXT_PUBLIC_PB_URL`)

**Returns:**
- PocketBase client instance

#### `createServerClient<T extends TypedPocketBase>(cookieStore: CookieStore)`

Creates a PocketBase client instance for use in server components with cookie-based authentication.

**Type Parameters:**
- `T` - Optional type parameter for adding TypeScript types to the PocketBase client

**Parameters:**
- `cookieStore`: Cookie store interface for managing authentication cookies
  - Can be Next.js cookies() object or custom implementation
  - Must implement get/set/delete methods

**Returns:**
- PocketBase client instance configured for server-side use

#### Types

##### `CookieStore`
Interface for cookie management:
```typescript
interface CookieStore {
  get: (name: string) => { value: string } | undefined
  set: (name: string, value: string, options?: CookieOptions) => void
  delete: (name: string) => void
}
```

##### `CookieOptions`
Options for cookie storage:
```typescript
interface CookieOptions {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}
```
