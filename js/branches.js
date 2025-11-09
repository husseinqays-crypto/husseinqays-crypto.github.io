// اسم العرض (label) + رمز المجلد (slug) + ملاحظة اختيارية
const BRANCHES = {
  mansour:   { label: "المنصور",            slug: "mansour"   },
  saydiya:   { label: "السيدية",            slug: "saydiya"   },
  zayona:    { label: "زيونة",              slug: "zayona"    },
  banook:    { label: "البنوك",              slug: "banook"    },
  outskirts: { label: "الاطراف و المحافظات", slug: "outskirts" },
  electronic:{ label: "الإلكتروني",         slug: "electronic" },
  hillah:    { label: "حضوري الحلة",        slug: "hillah"    },
  maysan:    { label: "حضوري ميسان",        slug: "maysan"    },
  kirkuk:    { label: "حضوري كركوك",        slug: "kirkuk"    },
};

// مساعدات
function getBranchBySlug(slug){
  return Object.values(BRANCHES).find(b => b.slug === slug) || null;
}
