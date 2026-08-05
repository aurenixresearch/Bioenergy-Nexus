export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

/**
 * Checks if a user profile is complete according to the 7 core tasks:
 * 1. Upload a profile picture.
 * 2. Add a biography.
 * 3. Add an institution.
 * 4. Add a country.
 * 5. Add research interests.
 * 6. Add contact information.
 * 7. Upload research.
 */
export function checkProfileCompleteness(profile: any, researchCount: number = 0): ProfileCompletenessResult {
  const missing: string[] = [];

  if (!profile) {
    return {
      isComplete: false,
      missingFields: [
        'Profile Picture',
        'Biography',
        'Institution / Organization',
        'Country',
        'Research Interests',
        'Contact Information',
        'Upload Research'
      ],
      completionPercent: 0,
      completedTasksCount: 0,
      totalTasksCount: 7
    };
  }

  // 1. Profile Picture
  const hasPicture = Boolean(
    profile.profilePicture && 
    profile.profilePicture.trim() !== '' && 
    !profile.profilePicture.includes('default') && 
    !profile.profilePicture.includes('placeholder')
  );
  if (!hasPicture) {
    missing.push('Profile Picture');
  }

  // 2. Biography
  const bio = (profile.bio || profile.professionalBio || profile.description || '').trim();
  if (!bio) {
    missing.push('Biography');
  }

  // 3. Institution
  const institution = (profile.institution || profile.organization || profile.organizationName || '').trim();
  if (!institution) {
    missing.push('Institution / Organization');
  }

  // 4. Country
  const country = (profile.country || profile.location || '').trim();
  if (!country) {
    missing.push('Country');
  }

  // 5. Research Interests
  const interests = profile.researchInterests || profile.primaryResearchArea;
  const hasInterests = Array.isArray(interests) ? interests.length > 0 : Boolean(interests && interests.trim());
  if (!hasInterests) {
    missing.push('Research Interests');
  }

  // 6. Contact Information (at least one contact method: email, website, orcid, scholar, linkedin, researchgate)
  const hasContact = Boolean(
    (profile.email && profile.email.trim()) ||
    (profile.website && profile.website.trim()) ||
    (profile.orcid && profile.orcid.trim()) ||
    (profile.googleScholar && profile.googleScholar.trim()) ||
    (profile.linkedin && profile.linkedin.trim()) ||
    (profile.researchgate && profile.researchgate.trim()) ||
    (profile.portfolioLinks?.website) ||
    (profile.portfolioLinks?.orcid)
  );
  if (!hasContact) {
    missing.push('Contact Information');
  }

  // 7. Upload Research
  const userPaperCount = researchCount || (Array.isArray(profile.publishedPapers) ? profile.publishedPapers.length : 0) || (Array.isArray(profile.publications) ? profile.publications.length : 0);
  if (userPaperCount <= 0) {
    missing.push('Upload Research');
  }

  const totalTasksCount = 7;
  const completedTasksCount = totalTasksCount - missing.length;
  const percent = Math.round((completedTasksCount / totalTasksCount) * 100);

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    completionPercent: percent,
    completedTasksCount,
    totalTasksCount
  };
}


