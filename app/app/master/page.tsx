
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MasterDashboard } from '@/components/master/master-dashboard';
import { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MasterPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'MASTER') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile as Profile} />
      <main className="flex-1">
        <MasterDashboard user={profile as Profile} />
      </main>
      <Footer />
    </div>
  );
}
