"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function EditUniversityButton({ slug }: { slug: string }) {
  const { data: session } = useSession();

  if (session?.user?.role !== "SUPER_ADMIN") return null;

  return (
    <Link
      href={`/admin/universities?edit=${slug}`}
      className="focus-ring stamp text-navy hover:bg-navy hover:text-white"
    >
      Edit this page
    </Link>
  );
}
