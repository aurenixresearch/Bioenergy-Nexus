export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

/**
 * Checks if a user profile is complete according to the core profile tasks:
 * 1. Profile picture / avatar.
 * 2. Biography / professional bio / title.
 * 3. Institution / organization / affiliation.
 * 4. Country / location.
 * 5. Research interests / focus area.
 * 6. Contact information (email, orcid, scholar, website, social).
 */
export function checkProfileCompleteness(profile: any, researchCount: number = 0): ProfileCompletenessResult {
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

  // 1. Direct complete flags or verified status
  if (
    profile.isProfileComplete === true || 
    profile.profileCompleted === true || 
    profile.isComplete === true ||
    profile.verified === true ||
    profile.isVerified === true ||
    profile.verificationStatus === 'verified' ||
    profile.role === 'super_admin' ||
    profile.role === 'admin'
  ) {
    return {
      isComplete: true,
      missingFields: [],
      completionPercent: 100,
      completedTasksCount: 6,
      totalTasksCount: 6
    };
  }

  // 2. Existing researchers with published papers or existing publications on the platform
  const hasExistingResearch = (
    researchCount > 0 ||
    (Array.isArray(profile.publishedPapers) && profile.publishedPapers.length > 0) ||
    (Array.isArray(profile.publications) && profile.publications.length > 0) ||
    (Array.isArray(profile.papers) && profile.papers.length > 0) ||
    (typeof profile.uploadedResearchCount === 'number' && profile.uploadedResearchCount > 0) ||
    (typeof profile.publishedResearchCount === 'number' && profile.publishedResearchCount > 0)
  );

  if (hasExistingResearch) {
    return {
      isComplete: true,
      missingFields: [],
      completionPercent: 100,
      completedTasksCount: 6,
      totalTasksCount: 6
    };
  }

  const missing: string[] = [];

  // 1. Profile Picture (allow profilePicture, photoURL, avatar, organizationLogo, or Google photo)
  const photo = profile.profilePicture || profile.photoURL || profile.avatar || profile.organizationLogo || profile.logo || profile.photo;
  const hasPicture = Boolean(
    photo && 
    typeof photo === 'string' &&
    photo.trim() !== ''
  );
  if (!hasPicture) {
    // If user has email or fullName, an avatar can be auto-generated or derived
    if (!profile.email && !profile.fullName && !profile.displayName) {
      missing.push('Profile Picture');
    }
  }

  // 2. Biography / Professional Overview
  const bio = (
    profile.bio || 
    profile.professionalBio || 
    profile.description || 
    profile.statement || 
    profile.about || 
    profile.organizationDescription || 
    profile.currentPosition || 
    profile.professionalTitle ||
    profile.title ||
    profile.role ||
    profile.userRole ||
    ''
  ).trim();
  if (!bio) {
    missing.push('Biography');
  }

  // 3. Institution / Organization
  const institution = (
    profile.institution || 
    profile.organization || 
    profile.organizationName || 
    profile.affiliation || 
    profile.university || 
    profile.department || 
    profile.company || 
    profile.school ||
    ''
  ).trim();
  if (!institution) {
    missing.push('Institution / Organization');
  }

  // 4. Country / Location
  const country = (
    profile.country || 
    profile.location || 
    profile.state || 
    profile.region || 
    profile.address || 
    profile.city || 
    profile.nationality ||
    ''
  ).trim();
  if (!country) {
    missing.push('Country');
  }

  // 5. Research Interests / Focus Area
  const interests = (
    profile.researchInterests || 
    profile.primaryResearchArea || 
    profile.interests || 
    profile.topics || 
    profile.expertise || 
    profile.areasOfSpecialization || 
    profile.secondaryResearchAreas ||
    profile.fieldsOfStudy ||
    profile.discipline
  );
  const hasInterests = Array.isArray(interests) 
    ? interests.length > 0 
    : Boolean(interests && (typeof interests === 'string' ? interests.trim() !== '' : true));
  if (!hasInterests) {
    missing.push('Research Interests');
  }

  // 6. Contact Information (email, website, orcid, scholar, linkedin, researchgate, or phone)
  const hasContact = Boolean(
    (profile.email && profile.email.trim()) ||
    (profile.contactEmail && profile.contactEmail.trim()) ||
    (profile.website && profile.website.trim()) ||
    (profile.orcid && profile.orcid.trim()) ||
    (profile.googleScholar && profile.googleScholar.trim()) ||
    (profile.linkedin && profile.linkedin.trim()) ||
    (profile.researchgate && profile.researchgate.trim()) ||
    (profile.phone && profile.phone.trim()) ||
    (profile.portfolioLinks?.website) ||
    (profile.portfolioLinks?.orcid) ||
    (profile.portfolioLinks?.googleScholar) ||
    (profile.portfolioLinks?.linkedin)
  );
  if (!hasContact) {
    missing.push('Contact Information');
  }

  const totalTasksCount = 6;
  const completedTasksCount = totalTasksCount - missing.length;
  const percent = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Existing researchers or scholars with sufficient academic baseline (has name + email + at least institution/interests/country)
  const isExistingScholar = Boolean(
    (profile.fullName || profile.displayName || profile.name) &&
    (profile.email || hasContact) &&
    (institution || country || hasInterests || bio)
  );

  // A profile is complete if no missing fields, or if sufficient profile details are provided
  const isComplete = missing.length === 0 || (
    Boolean(institution) &&
    Boolean(country) &&
    hasInterests &&
    hasContact
  ) || isExistingScholar;

  return {
    isComplete,
    missingFields: isComplete ? [] : missing,
    completionPercent: isComplete ? 100 : percent,
    completedTasksCount: isComplete ? totalTasksCount : completedTasksCount,
    totalTasksCount
  };
}


