import { redirect } from "next/navigation";

// This page redirects to the home page
export default function Page({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/home`);
}
