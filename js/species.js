/* Species profiles for the Pine Creek invasive plant webmap.
   Counts, acreage and cover are computed live from data/invasives.js;
   this file holds the descriptive text only.
   Sources: Calflora taxon pages; Cal-IPC Inventory; Cal-IPC (2020) "Impacts of Invasive
   Plants on Sierra Meadows"; Wild Ginger Botanical Consulting 2026 field notes.
   Ratings marked null have not been verified for this draft. */

window.GROUPS = {
  sod: {
    label: "Sod-forming pasture grasses",
    blurb: "Rhizomatous Eurasian grasses planted for forage, erosion control and roadside seeding. They spread underground and knit a dense sod that crowds out native bunchgrasses, sedges and forbs."
  },
  forage: {
    label: "Wet-meadow forage grasses",
    blurb: "Eurasian hay and pasture grasses that tolerate saturated soils. Because they persist where water tables are high, they can hold ground in the same wet zones that meadow restoration is trying to return to native sedges and rushes."
  },
  wetland: {
    label: "Streambank and wetland invader",
    blurb: "Tall, rhizomatous grass of channel margins and saturated ground that can form dense single-species stands."
  },
  forb: {
    label: "Perennial noxious forb",
    blurb: "Deep-rooted broadleaf weed that spreads from creeping roots and wind-blown seed."
  }
};

window.SPECIES = {
  "Bromus inermis": {
    common: "Smooth brome", code: "BRIN2", group: "sod", color: "#d9822b",
    origin: "Eurasia. Not native to California.",
    form: "Cool-season perennial grass; spreads by rhizomes and seed.",
    calipc: null,
    ecology: "Widely seeded for pasture, hay and erosion control across the West. Once established it forms a continuous sod that suppresses native grasses and forbs and reduces structural diversity. It tolerates drier soils better than wet-meadow natives, so it tends to hold the meadow edge, the sagebrush transition and ground where the water table has dropped.",
    pine: "By far the most extensive invader mapped in Pine Creek. Crews recorded it on road shoulders, constructed berms, creek banks and unmapped side channels, and moving into intact low sage communities. Most large polygons carry low canopy cover (a few percent), so the gross polygon acreage overstates the area the plant actually occupies.",
    restoration: "Raising meadow water tables can shift competition back toward native sedges and rushes on the wetter ground, but brome on berms and dry margins is likely to persist without direct treatment."
  },
  "Phalaris arundinacea": {
    common: "Reed canarygrass", code: "PHAR3", group: "wetland", color: "#7b4fa0",
    origin: "Calflora lists the species as native to California. Its aggressive behavior in western wetlands is widely attributed to introduced Eurasian genotypes and their hybrids.",
    form: "Tall perennial grass; spreads by thick rhizomes and seed.",
    calipc: null,
    ecology: "Tolerates prolonged flooding and colonizes open, wet, disturbed ground quickly. Dense stands can displace native wetland herbs, trap sediment and narrow channels. Cal-IPC's Sierra meadow review notes it appears to be favored by elevated soil nitrogen, as found in grazed or burned systems.",
    pine: "Mapped almost entirely at the water's edge: eroded banks, creek bends, side channels and a road crossing. Two occurrences sit in or beside a recently restored meadow, including a newly created shallow pool.",
    restoration: "Fresh, wet, open surfaces created by restoration are prime habitat for this species. Watching new ponds and graded areas in the first few years is the cheapest point of control. The 2026 survey did not determine genotype."
  },
  "Alopecurus pratensis": {
    common: "Meadow foxtail", code: "ALPR3", group: "forage", color: "#c9b33b",
    origin: "Eurasia. Not native to California.",
    form: "Perennial grass with short rhizomes; flowers early in the season.",
    calipc: "Watch",
    ecology: "Long planted in irrigated hay meadows because it tolerates flooding and saturated soils. That same tolerance lets it persist inside wet meadow plant communities rather than only on disturbed edges.",
    pine: "Found along water-filled channels and among inundated Nebraska sedge (Carex nebrascensis), at the boundary of Baltic rush (Juncus balticus) meadow and silver sagebrush (Artemisia cana), and as small patches in the Gordon and Gooch Valley drainages.",
    restoration: "Because it thrives in wet conditions, rewetting alone is unlikely to displace it. Track whether it expands after water tables rise."
  },
  "Phleum pratense": {
    common: "Timothy", code: "PHPR3", group: "forage", color: "#e3c565",
    origin: "Eurasia. Not native to California (a native alpine timothy, Phleum alpinum, also occurs in the region).",
    form: "Perennial bunchgrass with a swollen stem base; dense cylindrical seed head.",
    calipc: null,
    ecology: "A common hay and pasture grass and a frequent escapee in mesic Sierra and Cascade meadows. Cal-IPC's Sierra meadow review groups it with non-native grasses whose cover may be less damaging than aggressive sod-formers, though impacts are poorly studied.",
    pine: "Recorded on creek edges and on an earthen mound beside a canal and road.",
    restoration: "Lower priority than smooth brome or reed canarygrass, but worth tracking where it co-occurs with quackgrass."
  },
  "Elymus repens": {
    common: "Quackgrass", code: "ELRE4", group: "sod", color: "#b5523b",
    origin: "Eurasia. Not native to California.",
    form: "Perennial grass with an extensive, fast-growing rhizome network.",
    calipc: null,
    ecology: "A major agricultural weed. Small rhizome fragments can regrow, so ground disturbance and equipment can spread it.",
    pine: "A single 3.3-acre occurrence at the water's edge in the Antelope Mountain quad, mapped alongside a timothy patch.",
    restoration: "Clean equipment when working in this area; avoid moving soil from here to restoration sites."
  },
  "Thinopyrum intermedium": {
    common: "Intermediate wheatgrass", code: "THIN6", group: "sod", color: "#8c6d46",
    origin: "Eurasia. Not native to California. Jepson eFlora treats it as Elymus hispidus.",
    form: "Perennial grass; spreads by rhizomes.",
    calipc: null,
    ecology: "Seeded across the Great Basin for range rehabilitation and erosion control. It is drought tolerant and usually occupies upland and road-cut settings rather than wet meadow.",
    pine: "One small upland occurrence, about 500 feet from water.",
    restoration: "Small and isolated, so it is a good candidate for early removal."
  },
  "Cirsium arvense": {
    common: "Canada thistle", code: "CIAR4", group: "forb", color: "#c23b6e",
    origin: "Eurasia, despite the name. Not native to California.",
    form: "Perennial forb with deep, creeping horizontal roots; spreads by root fragments and wind-dispersed seed.",
    calipc: "Moderate",
    ecology: "Forms dense patches that reduce plant diversity. Studies of invaded Rocky Mountain meadows found lower native plant richness, fewer arthropods and slower litter decomposition, and grazing animals tend to avoid thistle-dominated ground.",
    pine: "A single small patch in an aspen stand and meadow beside the creek.",
    restoration: "An early-detection find. Infestations this small are the least costly to eradicate before roots spread."
  }
};

window.CONTEXT = {
  rare: [
    // Summary only. Locations of rare and special-interest plants are withheld on purpose.
    { sci: "Astragalus pulsiferae var. suksdorfii", common: "Suksdorf's milk-vetch", list: "TES", n: 2, note: "~160 plants, remapped" },
    { sci: "Erythranthe inflatula", common: "Ephemeral monkeyflower", list: "TES", n: 6, note: "~178 plants; 4 new occurrences" }
  ],
  si: [
    { sci: "Juncus hemiendytus var. abjectus", common: "Center Basin rush", n: 21 },
    { sci: "Senecio hydrophiloides", common: "Sweet marsh ragwort", n: 15 },
    { sci: "Eriogonum ovalifolium var. depressum", common: "Depressed wild buckwheat", n: 13 },
    { sci: "Carex petasata", common: "Liddon's sedge", n: 12 },
    { sci: "Diplacus pygmaeus", common: "Egg Lake monkeyflower", n: 9 },
    { sci: "Stenotus lanuginosus", common: "Woolly stenotus", n: 9 },
    { sci: "Castilleja lassenensis", common: "Lassen paintbrush", n: 3 },
    { sci: "Arnica fulgens", common: "Hillside arnica", n: 1 },
    { sci: "Carex davyi", common: "Davy's sedge", n: 1 },
    { sci: "Muhlenbergia jonesii", common: "Jones' muhly", n: 1 }
  ]
};
