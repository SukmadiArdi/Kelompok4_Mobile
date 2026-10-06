/**
 * Task 02 - Connect PresidenKu to REST API
 *
 * Data Model untuk "Program Prioritas" Presiden.
 * Field yang dibutuhkan aplikasi saja (id, name, description, image, status) —
 * field lain dari response API diabaikan saat parsing.
 */

export type ProgramStatus = 'active' | 'planned' | 'completed' | 'ongoing' | string;

export interface ProgramRaw {
  id?: number | string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  photoUrl?: string | null;
  status?: string | null;
}

export interface Program {
  id: number;
  name: string;
  description: string;
  image: string | null;
  status: ProgramStatus;
}

/**
 * Aman terhadap null/undefined & tipe data yang tidak konsisten:
 * JSON Response -> ProgramModel.fromJson() -> Object Program -> UI
 */
export const ProgramModel = {
  fromJson(json: ProgramRaw): Program | null {
    // Validasi minimum: id dan name harus ada agar item layak ditampilkan.
    if (json == null || typeof json !== 'object') return null;

    const parsedId = Number(json.id);
    const name = (json.name ?? json.title ?? '').toString().trim();
    if (!Number.isFinite(parsedId) || name === '') return null;

    const rawImage = json.image ?? json.imageUrl ?? json.photoUrl ?? null;
    const image =
      typeof rawImage === 'string' && rawImage.trim() !== '' ? rawImage.trim() : null;

    const rawStatus = (json.status ?? 'active').toString().trim().toLowerCase();

    return {
      id: parsedId,
      name,
      description: (json.description ?? '').toString().trim(),
      image,
      status: rawStatus === '' ? 'active' : rawStatus,
    };
  },

  fromList(jsonArray: unknown): Program[] {
    if (!Array.isArray(jsonArray)) return [];
    return jsonArray
      .map((item) => ProgramModel.fromJson(item as ProgramRaw))
      .filter((item): item is Program => item !== null);
  },
};

export default ProgramModel;
