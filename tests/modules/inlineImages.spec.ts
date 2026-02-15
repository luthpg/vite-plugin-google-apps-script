import fs from 'node:fs/promises';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inlineImages } from '../../src/modules/inlineImages';

// モジュールのモック化
vi.mock('node:fs/promises');
vi.mock('sharp');

describe('inlineImages', () => {
  // テストごとのクリーンアップ
  afterEach(() => {
    vi.clearAllMocks();
  });

  // sharpのモックヘルパー
  const mockSharpInstance = {
    metadata: vi.fn(),
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn(),
  };

  // sharp() が呼ばれたら mockSharpInstance を返すように設定
  beforeEach(() => {
    (sharp as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSharpInstance,
    );
  });

  it('should return null if disabled', async () => {
    const plugin = inlineImages({ enable: false });
    expect(plugin).toBeNull();
  });

  it('should ignore non-image files', async () => {
    const plugin = inlineImages({ enable: true });
    // @ts-expect-error
    const result = await plugin.transform('code', 'script.ts');
    expect(result).toBeNull();
  });

  it('should process image, resize, and wrap in SVG', async () => {
    // 1. fs.readFile のモック
    const dummyBuffer = Buffer.from('dummy');
    (fs.readFile as any).mockResolvedValue(dummyBuffer);

    // 2. sharp の挙動モック
    // metadata() が巨大なサイズを返す -> resize が呼ばれるはず
    mockSharpInstance.metadata.mockResolvedValue({ width: 2000, height: 1000 });

    // toBuffer() が変換後のデータを返す
    mockSharpInstance.toBuffer.mockResolvedValue({
      data: Buffer.from('processed'),
      info: { width: 1000, height: 500 }, // リサイズ後のサイズ
    });

    const plugin = inlineImages({ enable: true, maxWidth: 1000 });

    const transformContext = { error: vi.fn() };
    // @ts-expect-error: apply call
    const result = await plugin.transform.call(
      transformContext,
      'code',
      'image.png',
    );

    // 検証
    expect(fs.readFile).toHaveBeenCalledWith('image.png');
    expect(sharp).toHaveBeenCalledWith(dummyBuffer);
    expect(mockSharpInstance.metadata).toHaveBeenCalled();

    // maxWidth(1000) < width(2000) なので resize が呼ばれるべき
    expect(mockSharpInstance.resize).toHaveBeenCalledWith({
      width: 1000,
      withoutEnlargement: true,
    });

    // WebP変換が呼ばれるべき
    expect(mockSharpInstance.webp).toHaveBeenCalled();

    // 結果の検証 (SVG構造が含まれているか)
    expect(result).not.toBeNull();
    if (result && typeof result === 'object' && 'code' in result) {
      expect(result.code).toContain('export default "');
      expect(result.code).toContain('<svg');
      expect(result.code).toContain('viewBox=\\"0 0 1000 500\\"'); // リサイズ後のサイズ
      expect(result.code).toContain('data:image/webp;base64,');
    }
  });

  it('should NOT resize if image is smaller than maxWidth', async () => {
    (fs.readFile as any).mockResolvedValue(Buffer.from('dummy'));

    // metadata() が小さいサイズを返す
    mockSharpInstance.metadata.mockResolvedValue({ width: 500, height: 500 });

    mockSharpInstance.toBuffer.mockResolvedValue({
      data: Buffer.from('processed'),
      info: { width: 500, height: 500 },
    });

    const plugin = inlineImages({ enable: true, maxWidth: 1000 });

    const transformContext = { error: vi.fn() };
    // @ts-expect-error
    await plugin.transform.call(transformContext, 'code', 'small.png');

    // resize は呼ばれないはず
    expect(mockSharpInstance.resize).not.toHaveBeenCalled();
    // webp 変換は常に行われる
    expect(mockSharpInstance.webp).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    (fs.readFile as any).mockRejectedValue(new Error('File not found'));

    const plugin = inlineImages({ enable: true });
    const transformContext = { error: vi.fn() };

    // @ts-expect-error
    await plugin.transform.call(transformContext, 'code', 'error.png');

    expect(transformContext.error).toHaveBeenCalledWith(
      expect.stringContaining('Optimization failed'),
    );
  });
});
