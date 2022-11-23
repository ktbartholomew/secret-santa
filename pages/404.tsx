import Link from "next/link";
import Button from "../components/button";

export default function ErrorPage({ serverError, ...props }) {
  return (
    <div className="p-5">
      <div className="p-5 mb-5 bg-red-200 border border-red-300">
        Sorry, the page you were looking for can’t be found.
      </div>
      <div>
        <Link href="/">
          <Button design="blue">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
