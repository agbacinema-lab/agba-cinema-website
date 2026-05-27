import { db } from "@/lib/firebase-admin";

const categoryToSection: Record<string, string> = {
  // Video section
  "documentary": "Video",
  "motion graphic": "Video",
  "short form": "Video",
  "event": "Video",
  "product launch": "Video",
  "brand story": "Video",

  // Graphics section
  "logo": "Graphics",
  "brand identity": "Graphics",
  "social": "Graphics",
  "print": "Graphics",
  "packaging": "Graphics",

  // Content Writing section
  "scripts": "Content Writing",
  "copywriting": "Content Writing",
  "ad copy": "Content Writing",
  "blog": "Content Writing",
  "seo": "Content Writing",
  "case study": "Content Writing",

  // Digital Marketing section
  "campaign": "Digital Marketing",
  "social ads": "Digital Marketing",
  "growth": "Digital Marketing",
  "strategy": "Digital Marketing",
  "analytics": "Digital Marketing",
};

export async function POST(req: Request) {
  try {
    if (!db) {
      return Response.json(
        { error: "Firebase Admin SDK not initialized. Check environment variables." },
        { status: 500 }
      );
    }

    const portfolioCol = db.collection("portfolio");
    const snapshot = await portfolioCol.get();

    let migrated = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
      const item = docSnap.data();

      // Skip if already has portfolioSection
      if (item.portfolioSection) {
        skipped++;
        continue;
      }

      const category = (item.category || "").toLowerCase();
      const section = categoryToSection[category];

      if (section) {
        await docSnap.ref.update({
          portfolioSection: section,
        });
        migrated++;
      }
    }

    return Response.json({
      success: true,
      message: `Migration complete: ${migrated} items updated, ${skipped} items skipped (already had portfolioSection)`,
      migrated,
      skipped,
      total: snapshot.docs.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      { error: "Migration failed", details: (error as any).message },
      { status: 500 }
    );
  }
}
