import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryAdapter, setStorageAdapter, saveReadingBundle, listScans, deleteScan, getScanBundle, addFeedback, listFeedback, deleteSavedImages, exportAllData } from '../services/storageService.js';

const user = { id: 'usr_test' };
const features = { lines: { life: {}, head: {}, heart: {}, fate: {} }, palmShape: {}, detectionConfidence: { overall: 70 } };
const readings = [{ category: 'love', title: 'Love Reading' }];

describe('storage service (memory adapter)', () => {
  beforeEach(() => setStorageAdapter(createMemoryAdapter()));

  it('does not store an image without consent', async () => {
    const id = await saveReadingBundle({ user, scan: { handType: 'left' }, features, readings, imageDataUrl: 'data:image/jpeg;base64,xx', consentToStoreImage: false });
    const { scan } = await getScanBundle(id);
    expect(scan.imageReference).toBeNull();
  });

  it('stores, lists, cascades deletes and strips images', async () => {
    const id = await saveReadingBundle({ user, scan: { handType: 'right' }, features, readings, imageDataUrl: 'data:image/jpeg;base64,xx', consentToStoreImage: true });
    let scans = await listScans({ userId: user.id });
    expect(scans).toHaveLength(1);
    expect(scans[0].readings).toHaveLength(1);
    expect(scans[0].imageReference).toMatch(/^data:image/);

    await addFeedback({ userId: user.id, readingId: scans[0].readings[0].id, rating: 5 });
    expect(await listFeedback()).toHaveLength(1);

    const exported = await exportAllData();
    expect(exported.scans[0].imageReference).toBe('[image omitted]');

    expect(await deleteSavedImages()).toBe(1);
    expect((await getScanBundle(id)).scan.imageReference).toBeNull();

    await deleteScan(id);
    scans = await listScans();
    expect(scans).toHaveLength(0);
    expect(await listFeedback()).toHaveLength(0);
  });
});
