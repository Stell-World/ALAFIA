import { afterEach, describe, expect, it, vi } from "vitest";

import {
  findVerifiedProfessionals,
  registerPatient,
  registerProfessional,
} from "@/lib/professional-api";

afterEach(() => vi.unstubAllGlobals());

describe("professional account API contract", () => {
  it("submits patient registration as JSON with a credentialed request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ userId: "user-1", role: "PATIENT" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await registerPatient({
      role: "PATIENT",
      firstName: "Afi",
      lastName: "Test",
      email: "afi@example.test",
      phone: "+22890000000",
      password: "test-password-value",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).toContain('"role":"PATIENT"');
  });

  it("sends professional documents as multipart files without browser storage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ requestId: "request-1", status: "PENDING_VERIFICATION" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const diploma = new File(["qualification"], "diplome.pdf", { type: "application/pdf" });
    const data = {
      role: "PROFESSIONAL" as const,
      firstName: "Afi",
      lastName: "Test",
      email: "afi@example.test",
      phone: "+22890000000",
      password: "test-password-value",
      specialty: "Médecine générale",
      professionalId: "",
      facility: "Centre de santé",
      city: "Lomé",
      address: "Adresse indiquée par le professionnel",
      experience: "",
      presentation: "Présentation de test",
    };

    const result = await registerProfessional(data, { diploma: [diploma], identity: [] });
    const init = fetchMock.mock.calls[0]?.[1];
    const body = init?.body as FormData;

    expect(result.status).toBe("PENDING_VERIFICATION");
    expect(init?.credentials).toBe("include");
    expect(body.get("diplomas")).toBe(diploma);
    expect(body.get("identityDocuments")).toBeNull();
    expect(init?.headers).toBeUndefined();
  });

  it("requires the verified-only filter when searching professionals", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ professionals: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await findVerifiedProfessionals("Pédiatrie", "Lomé");

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("verified=true");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("specialty=P%C3%A9diatrie");
  });

  it("does not treat an HTML fallback as a successful account creation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>frontend fallback</html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }),
      ),
    );

    await expect(
      registerPatient({
        role: "PATIENT",
        firstName: "Afi",
        lastName: "Test",
        email: "afi@example.test",
        phone: "+22890000000",
        password: "test-password-value",
      }),
    ).rejects.toThrow("n’est pas configuré");
  });
});
