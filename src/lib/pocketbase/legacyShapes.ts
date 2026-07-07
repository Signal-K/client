/**
 * Maps Pocketbase records back to the shape their original raw-SQL row had
 * (original DB column names, legacyId as `id`), so existing frontend
 * consumers of these API routes don't need to change as routes move off
 * Prisma/Postgres onto the Pocketbase SDK. See pocketbase/README.md.
 */

export function mapAnomalyToRow(a: Record<string, any>) {
  return {
    id: a.legacyId,
    content: a.content,
    ticId: a.ticId,
    anomalytype: a.anomalytype,
    type: a.type,
    radius: a.radius,
    mass: a.mass,
    density: a.density,
    gravity: a.gravity,
    temperatureEq: a.temperatureEq,
    temperature: a.temperature,
    smaxis: a.smaxis,
    orbital_period: a.orbitalPeriod,
    classification_status: a.classificationStatus,
    avatar_url: a.avatarUrl,
    created_at: a.createdAt,
    deepnote: a.deepnote,
    lightkurve: a.lightkurve,
    configuration: a.configuration,
    parentAnomaly: a.parentAnomaly,
    anomalySet: a.anomalySet,
    anomalyConfiguration: a.anomalyConfiguration,
  };
}

export function mapClassificationToRow(c: Record<string, any>) {
  return {
    id: c.legacyId,
    created_at: c.createdAt,
    content: c.content,
    author: c.author,
    anomaly: c.anomaly,
    media: c.media,
    classificationtype: c.classificationtype,
    classificationConfiguration: c.classificationConfiguration,
  };
}

export function mapCommentToRow(c: Record<string, any>) {
  return {
    id: c.legacyId,
    created_at: c.createdAt,
    content: c.content,
    author: c.author,
    classification_id: c.classificationId,
    parent_comment_id: c.parentCommentId,
    configuration: c.configuration,
    uploads: c.uploads,
    surveyor: c.surveyor,
    confirmed: c.confirmed,
    value: c.value,
    category: c.category,
  };
}

export function mapVoteToRow(v: Record<string, any>) {
  return {
    id: v.legacyId,
    user_id: v.userId,
    classification_id: v.classificationId,
    anomaly_id: v.anomalyId,
    created_at: v.createdAt,
    upload: v.upload,
    vote_type: v.voteType,
  };
}

export function mapProfileToRow(p: Record<string, any>) {
  return {
    id: p.userId,
    updated_at: p.updatedAt,
    username: p.username,
    full_name: p.fullName,
    avatar_url: p.avatarUrl,
    website: p.website,
    location: p.location,
    activemission: p.activemission,
    classificationPoints: p.classificationPoints,
    push_subscription: p.pushSubscription,
    referral_code: p.referralCode,
  };
}

export function mapInventoryToRow(i: Record<string, any>) {
  return {
    id: i.legacyId,
    item: i.item,
    owner: i.owner,
    quantity: i.quantity,
    notes: i.notes,
    time_of_deploy: i.timeOfDeploy,
    anomaly: i.anomaly,
    parentItem: i.parentItem,
    configuration: i.configuration,
    terrarium: i.terrarium,
  };
}

export function mapMissionToRow(m: Record<string, any>) {
  return {
    id: m.legacyId,
    user: m.userId,
    time_of_completion: m.timeOfCompletion,
    mission: m.mission,
    configuration: m.configuration,
    rewarded_items: m.rewardedItems,
  };
}

export function mapUploadToRow(u: Record<string, any>) {
  return {
    id: u.legacyId,
    author: u.author,
    location: u.location,
    configuration: u.configuration,
    source: u.source,
    file_url: u.fileUrl,
    created_at: u.createdAt,
    content: u.content,
    name: u.name,
    originating_location: u.originatingLocation,
  };
}

export function mapMineralDepositToRow(m: Record<string, any>) {
  return {
    id: m.legacyId,
    anomaly: m.anomaly,
    owner: m.owner,
    mineral_configuration: m.mineralConfiguration,
    location: m.location,
    discovery: m.discovery,
    created_at: m.createdAt,
    rover_name: m.roverName,
  };
}

export function mapLinkedAnomalyToRow(l: Record<string, any>) {
  return {
    id: l.legacyId,
    author: l.author,
    anomaly_id: l.anomalyId,
    classification_id: l.classificationId,
    date: l.date,
    automaton: l.automaton,
    unlocked: l.unlocked,
    unlock_time: l.unlockTime,
  };
}
