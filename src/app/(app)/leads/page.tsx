import { getLeads, getCompanies, getCurrentUserProfile, getProfiles } from "@/lib/data";
import { LeadsViewContainer } from "@/components/LeadsViewContainer";

export default async function LeadsPage() {
  const [leads, companies, currentProfile, profiles] = await Promise.all([
    getLeads(),
    getCompanies(),
    getCurrentUserProfile(),
    getProfiles(),
  ]);

  return (
    <section>
      <LeadsViewContainer
        leads={leads}
        companies={companies}
        currentProfile={currentProfile}
        profiles={profiles}
      />
    </section>
  );
}
