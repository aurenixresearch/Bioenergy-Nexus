export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

/**
 * Checks if a user profile is complete according to the 6 core profile tasks:
 * 1. Upload a profile picture.
 * 2. Add a biography / professional bio.
 * 3. Add an institution / organization.
 * 4. Add a country / location.
 * 5. Add research interests.
 * 6. Add contact information.
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
        'Contact Information'
      ],
      completionPercent: 0,
      completedTasksCount: 0,
      totalTasksCount: 6
    };
  }

  // 1. Profile Picture
  const photo = profile.profilePicture || profile.photoURL || profile.avatar || profile.organizationLogo;
  const hasPicture = Boolean(
    photo && 
    typeof photo === 'string' &&
    photo.trim() !== '' && 
    !photo.includes('default') && 
    !photo.includes('placeholder')
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
  const institution = (profile.institution || profile.organization || profile.organizationName || profile.affiliation || '').trim();
  if (!institution) {
    missing.push('Institution / Organization');
  }

  // 4. Country
  const country = (profile.country || profile.location || '').trim();
  if (!country) {
    missing.push('Country');
  }

  // 5. Research Interests
  const interests = profile.researchInterests || profile.primaryResearchArea || profile.interests;
  const hasInterests = Array.isArray(interests) ? interests.length > 0 : Boolean(interests && interests.trim());
  if (!hasInterests) {
    missing.push('Research Interests');
  }

  // 6. Contact Information (email, website, orcid, scholar, linkedin, researchgate, or phone)
  const hasContact = Boolean(
    (profile.email && profile.email.trim()) ||
    (profile.website && profile.website.trim()) ||
    (profile.orcid && profile.orcid.trim()) ||
    (profile.googleScholar && profile.googleScholar.trim()) ||
    (profile.linkedin && profile.linkedin.trim()) ||
    (profile.researchgate && profile.researchgate.trim()) ||
    (profile.phone && profile.phone.trim()) ||
    (profile.portfolioLinks?.website) ||
    (profile.portfolioLinks?.orcid)
  );
  if (!hasContact) {
    missing.push('Contact Information');
  }

  const totalTasksCount = 6;
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


