package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.*;
import com.tokoagar.inventori.entity.Barang;
import com.tokoagar.inventori.entity.Penyuplai;
import com.tokoagar.inventori.entity.TransaksiKeluar;
import com.tokoagar.inventori.entity.TransaksiMasuk;
import com.tokoagar.inventori.repository.*;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.Border;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LaporanService {

    private final TransaksiMasukRepository transaksiMasukRepository;
    private final TransaksiKeluarRepository transaksiKeluarRepository;
    private final BarangRepository barangRepository;
    private final KategoriRepository kategoriRepository;
    private final PenyuplaiRepository penyuplaiRepository;
    private final TransaksiMasukService transaksiMasukService;
    private final TransaksiKeluarService transaksiKeluarService;
    private final BarangService barangService;

    // Warna tema
    private static final DeviceRgb INDIGO = new DeviceRgb(67, 56, 202);
    private static final DeviceRgb INDIGO_LIGHT = new DeviceRgb(224, 221, 255);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb GRAY_50 = new DeviceRgb(249, 250, 251);
    private static final DeviceRgb GRAY_200 = new DeviceRgb(229, 231, 235);
    private static final DeviceRgb GRAY_500 = new DeviceRgb(107, 114, 128);
    private static final DeviceRgb GRAY_800 = new DeviceRgb(31, 41, 55);

    public LaporanService(TransaksiMasukRepository transaksiMasukRepository,
                          TransaksiKeluarRepository transaksiKeluarRepository,
                          BarangRepository barangRepository,
                          KategoriRepository kategoriRepository,
                          PenyuplaiRepository penyuplaiRepository,
                          TransaksiMasukService transaksiMasukService,
                          TransaksiKeluarService transaksiKeluarService,
                          BarangService barangService) {
        this.transaksiMasukRepository = transaksiMasukRepository;
        this.transaksiKeluarRepository = transaksiKeluarRepository;
        this.barangRepository = barangRepository;
        this.kategoriRepository = kategoriRepository;
        this.penyuplaiRepository = penyuplaiRepository;
        this.transaksiMasukService = transaksiMasukService;
        this.transaksiKeluarService = transaksiKeluarService;
        this.barangService = barangService;
    }

    public DashboardResponse getDashboard() {
        List<BarangResponse> stokMinimum = barangRepository.findBarangStokMinimum().stream()
                .map(barangService::toResponse)
                .collect(Collectors.toList());

        List<TransaksiMasukResponse> pending = transaksiMasukRepository.findByStatus("PENDING").stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());

        List<TransaksiMasukResponse> rejected = transaksiMasukRepository.findByStatus("REJECTED").stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalBarang(barangRepository.count())
                .totalKategori(kategoriRepository.count())
                .totalPenyuplai(penyuplaiRepository.count())
                .totalTransaksiMasuk(transaksiMasukRepository.countApproved())
                .totalTransaksiKeluar(transaksiKeluarRepository.count())
                .barangStokMinimum(stokMinimum)
                .pendingCount(pending.size())
                .transaksiPending(pending)
                .transaksiRejected(rejected)
                .build();
    }

    public LaporanHarianResponse getLaporanHarian(LocalDate tanggal, Long penyuplaiId) {
        LocalDateTime startOfDay = tanggal.atStartOfDay();
        LocalDateTime endOfDay = tanggal.atTime(LocalTime.MAX);

        List<TransaksiMasuk> masukEntities;
        if (penyuplaiId != null) {
            masukEntities = transaksiMasukRepository.findByTanggalMasukBetweenAndPenyuplaiId(startOfDay, endOfDay, penyuplaiId);
        } else {
            masukEntities = transaksiMasukRepository.findByTanggalMasukBetween(startOfDay, endOfDay);
        }

        List<TransaksiMasukResponse> masuk = masukEntities.stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());

        List<TransaksiKeluar> keluarEntities;
        if (penyuplaiId != null) {
            Set<Long> barangIds = masukEntities.stream()
                    .map(t -> t.getBarang().getId())
                    .collect(Collectors.toSet());
            if (!barangIds.isEmpty()) {
                keluarEntities = transaksiKeluarRepository.findByTanggalKeluarBetweenAndBarangIdIn(
                        startOfDay, endOfDay, new ArrayList<>(barangIds));
            } else {
                keluarEntities = Collections.emptyList();
            }
        } else {
            keluarEntities = transaksiKeluarRepository.findByTanggalKeluarBetween(startOfDay, endOfDay);
        }

        List<TransaksiKeluarResponse> keluar = keluarEntities.stream()
                .map(transaksiKeluarService::toResponse)
                .collect(Collectors.toList());

        int totalMasuk = masuk.stream().mapToInt(TransaksiMasukResponse::getJumlah).sum();
        int totalKeluar = keluar.stream().mapToInt(TransaksiKeluarResponse::getJumlah).sum();

        List<BarangLaporanSummary> rekapBarang = buildRekapBarang(masukEntities, keluarEntities);

        return LaporanHarianResponse.builder()
                .tanggal(tanggal.toString())
                .transaksiMasuk(masuk)
                .transaksiKeluar(keluar)
                .totalMasuk(totalMasuk)
                .totalKeluar(totalKeluar)
                .rekapBarang(rekapBarang)
                .build();
    }

    private List<BarangLaporanSummary> buildRekapBarang(List<TransaksiMasuk> masukList,
                                                        List<TransaksiKeluar> keluarList) {
        Set<Long> allBarangIds = new LinkedHashSet<>();
        masukList.forEach(t -> allBarangIds.add(t.getBarang().getId()));
        keluarList.forEach(t -> allBarangIds.add(t.getBarang().getId()));

        Map<Long, Integer> masukMap = masukList.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getBarang().getId(),
                        Collectors.summingInt(TransaksiMasuk::getJumlah)));

        Map<Long, Integer> keluarMap = keluarList.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getBarang().getId(),
                        Collectors.summingInt(TransaksiKeluar::getJumlah)));

        Map<Long, Barang> barangMap = new HashMap<>();
        masukList.forEach(t -> barangMap.putIfAbsent(t.getBarang().getId(), t.getBarang()));
        keluarList.forEach(t -> barangMap.putIfAbsent(t.getBarang().getId(), t.getBarang()));

        List<BarangLaporanSummary> result = new ArrayList<>();
        for (Long barangId : allBarangIds) {
            Barang b = barangMap.get(barangId);
            if (b == null) continue;

            result.add(BarangLaporanSummary.builder()
                    .barangId(barangId)
                    .namaBarang(b.getNamaBarang())
                    .satuan(b.getSatuan())
                    .totalMasuk(masukMap.getOrDefault(barangId, 0))
                    .totalKeluar(keluarMap.getOrDefault(barangId, 0))
                    .stokSaatIni(b.getStok())
                    .build());
        }
        return result;
    }

    private String resolvePenyuplaiName(Long penyuplaiId) {
        if (penyuplaiId == null) return "Semua Penyuplai";
        return penyuplaiRepository.findById(penyuplaiId)
                .map(Penyuplai::getNamaPenyuplai)
                .orElse("Semua Penyuplai");
    }

    // ═══════════════════════════════════════════════
    //              EXPORT PDF (iText 7)
    // ═══════════════════════════════════════════════
    public byte[] exportPdf(LocalDate tanggal, Long penyuplaiId) {
        LaporanHarianResponse laporan = getLaporanHarian(tanggal, penyuplaiId);
        String namaPenyuplai = resolvePenyuplaiName(penyuplaiId);
        DateTimeFormatter fmtTanggal = DateTimeFormatter.ofPattern("dd MMMM yyyy", new Locale("id", "ID"));
        DateTimeFormatter fmtCetak = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm", new Locale("id", "ID"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.setMargins(36, 36, 36, 36);

            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // ──── HEADER ────
            doc.add(new Paragraph("TOKO AGAR D.A.")
                    .setFont(bold).setFontSize(20).setFontColor(INDIGO)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(0));
            doc.add(new Paragraph("Sistem Informasi Manajemen Inventori")
                    .setFont(italic).setFontSize(10).setFontColor(GRAY_500)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(0));
            doc.add(new Paragraph("Jl. Raya Cibogo, Plered, Purwakarta, Jawa Barat")
                    .setFont(regular).setFontSize(9).setFontColor(GRAY_500)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(8));

            // Garis pemisah tebal
            SolidLine solidLine = new SolidLine(2f);
            solidLine.setColor(INDIGO);
            doc.add(new LineSeparator(solidLine).setMarginBottom(12));

            doc.add(new Paragraph("LAPORAN HARIAN")
                    .setFont(bold).setFontSize(14).setFontColor(GRAY_800)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(4));

            // Info tanggal dan penyuplai
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            infoTable.setBorder(Border.NO_BORDER);
            infoTable.addCell(new Cell().add(new Paragraph("Tanggal: " + tanggal.format(fmtTanggal))
                            .setFont(regular).setFontSize(10))
                    .setBorder(Border.NO_BORDER));
            infoTable.addCell(new Cell().add(new Paragraph("Penyuplai: " + namaPenyuplai)
                            .setFont(regular).setFontSize(10))
                    .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            doc.add(infoTable);
            doc.add(new Paragraph("").setMarginBottom(10));

            // Map barangId -> satuan dari rekapBarang
            Map<Long, String> satuanMap = new HashMap<>();
            if (laporan.getRekapBarang() != null) {
                laporan.getRekapBarang().forEach(r -> satuanMap.put(r.getBarangId(), r.getSatuan()));
            }

            // ──── TABEL BARANG MASUK ────
            if (!laporan.getTransaksiMasuk().isEmpty()) {
                doc.add(new Paragraph("BARANG MASUK")
                        .setFont(bold).setFontSize(11).setFontColor(INDIGO).setMarginBottom(4));

                Table tblMasuk = new Table(UnitValue.createPercentArray(new float[]{8, 42, 25, 25}))
                        .useAllAvailableWidth();

                // Header row
                String[] hdrMasuk = {"No", "Nama Barang", "Jumlah", "Satuan"};
                for (String h : hdrMasuk) {
                    tblMasuk.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setFont(bold).setFontSize(9).setFontColor(WHITE))
                            .setBackgroundColor(INDIGO).setPadding(6)
                            .setTextAlignment(TextAlignment.CENTER));
                }

                // Data rows (striped)
                int no = 1;
                for (TransaksiMasukResponse t : laporan.getTransaksiMasuk()) {
                    DeviceRgb rowBg = (no % 2 == 0) ? GRAY_50 : WHITE;
                    String satuan = satuanMap.getOrDefault(t.getBarangId(), "-");

                    tblMasuk.addCell(createDataCell(String.valueOf(no++), regular, rowBg, TextAlignment.CENTER));
                    tblMasuk.addCell(createDataCell(t.getNamaBarang(), regular, rowBg, TextAlignment.LEFT));
                    tblMasuk.addCell(createDataCell(String.valueOf(t.getJumlah()), regular, rowBg, TextAlignment.CENTER));
                    tblMasuk.addCell(createDataCell(satuan, regular, rowBg, TextAlignment.CENTER));
                }

                // Total row
                tblMasuk.addCell(new Cell(1, 2)
                        .add(new Paragraph("Total Masuk").setFont(bold).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6)
                        .setTextAlignment(TextAlignment.RIGHT));
                tblMasuk.addCell(new Cell()
                        .add(new Paragraph(String.valueOf(laporan.getTotalMasuk())).setFont(bold).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6)
                        .setTextAlignment(TextAlignment.CENTER));
                tblMasuk.addCell(new Cell()
                        .add(new Paragraph("").setFont(regular).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6));

                doc.add(tblMasuk);
                doc.add(new Paragraph("").setMarginBottom(12));
            }

            // ──── TABEL BARANG KELUAR (dikelompokkan per barang) ────
            List<BarangLaporanSummary> keluarItems = laporan.getRekapBarang() != null
                    ? laporan.getRekapBarang().stream().filter(r -> r.getTotalKeluar() > 0).collect(Collectors.toList())
                    : Collections.emptyList();

            if (!keluarItems.isEmpty()) {
                doc.add(new Paragraph("BARANG KELUAR")
                        .setFont(bold).setFontSize(11).setFontColor(INDIGO).setMarginBottom(4));

                Table tblKeluar = new Table(UnitValue.createPercentArray(new float[]{8, 42, 25, 25}))
                        .useAllAvailableWidth();

                String[] hdrKeluar = {"No", "Nama Barang", "Jumlah", "Satuan"};
                for (String h : hdrKeluar) {
                    tblKeluar.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setFont(bold).setFontSize(9).setFontColor(WHITE))
                            .setBackgroundColor(INDIGO).setPadding(6)
                            .setTextAlignment(TextAlignment.CENTER));
                }

                int noK = 1;
                for (BarangLaporanSummary item : keluarItems) {
                    DeviceRgb rowBg = (noK % 2 == 0) ? GRAY_50 : WHITE;
                    tblKeluar.addCell(createDataCell(String.valueOf(noK++), regular, rowBg, TextAlignment.CENTER));
                    tblKeluar.addCell(createDataCell(item.getNamaBarang(), regular, rowBg, TextAlignment.LEFT));
                    tblKeluar.addCell(createDataCell(String.valueOf(item.getTotalKeluar()), regular, rowBg, TextAlignment.CENTER));
                    tblKeluar.addCell(createDataCell(item.getSatuan(), regular, rowBg, TextAlignment.CENTER));
                }

                tblKeluar.addCell(new Cell(1, 2)
                        .add(new Paragraph("Total Keluar").setFont(bold).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6)
                        .setTextAlignment(TextAlignment.RIGHT));
                tblKeluar.addCell(new Cell()
                        .add(new Paragraph(String.valueOf(laporan.getTotalKeluar())).setFont(bold).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6)
                        .setTextAlignment(TextAlignment.CENTER));
                tblKeluar.addCell(new Cell()
                        .add(new Paragraph("").setFont(regular).setFontSize(9))
                        .setBackgroundColor(INDIGO_LIGHT).setPadding(6));

                doc.add(tblKeluar);
                doc.add(new Paragraph("").setMarginBottom(12));
            }

            // ──── RINGKASAN ────
            if (laporan.getRekapBarang() != null && !laporan.getRekapBarang().isEmpty()) {
                doc.add(new Paragraph("RINGKASAN STOK")
                        .setFont(bold).setFontSize(11).setFontColor(INDIGO).setMarginBottom(4));

                Table tblRingkasan = new Table(UnitValue.createPercentArray(new float[]{8, 30, 15, 15, 15, 17}))
                        .useAllAvailableWidth();

                String[] hdrRingkasan = {"No", "Nama Barang", "Masuk", "Keluar", "Sisa Stok", "Satuan"};
                for (String h : hdrRingkasan) {
                    tblRingkasan.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setFont(bold).setFontSize(9).setFontColor(WHITE))
                            .setBackgroundColor(INDIGO).setPadding(6)
                            .setTextAlignment(TextAlignment.CENTER));
                }

                int noR = 1;
                for (BarangLaporanSummary item : laporan.getRekapBarang()) {
                    DeviceRgb rowBg = (noR % 2 == 0) ? GRAY_50 : WHITE;
                    tblRingkasan.addCell(createDataCell(String.valueOf(noR++), regular, rowBg, TextAlignment.CENTER));
                    tblRingkasan.addCell(createDataCell(item.getNamaBarang(), regular, rowBg, TextAlignment.LEFT));
                    tblRingkasan.addCell(createDataCell(String.valueOf(item.getTotalMasuk()), regular, rowBg, TextAlignment.CENTER));
                    tblRingkasan.addCell(createDataCell(String.valueOf(item.getTotalKeluar()), regular, rowBg, TextAlignment.CENTER));
                    tblRingkasan.addCell(createDataCell(String.valueOf(item.getStokSaatIni()), regular, rowBg, TextAlignment.CENTER));
                    tblRingkasan.addCell(createDataCell(item.getSatuan(), regular, rowBg, TextAlignment.CENTER));
                }

                doc.add(tblRingkasan);
                doc.add(new Paragraph("").setMarginBottom(12));
            }

            // Empty state
            if (laporan.getTransaksiMasuk().isEmpty() && laporan.getTransaksiKeluar().isEmpty()) {
                doc.add(new Paragraph("Tidak ada transaksi pada tanggal ini.")
                        .setFont(italic).setFontSize(10).setFontColor(GRAY_500)
                        .setTextAlignment(TextAlignment.CENTER).setMarginTop(20));
            }

            // ──── FOOTER ────
            SolidLine footerLine = new SolidLine(1f);
            footerLine.setColor(GRAY_200);
            doc.add(new LineSeparator(footerLine).setMarginTop(16).setMarginBottom(8));

            doc.add(new Paragraph("Dicetak oleh Sistem Informasi Manajemen Inventori")
                    .setFont(italic).setFontSize(8).setFontColor(GRAY_500)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(0));
            doc.add(new Paragraph("Toko Agar D.A. \u00A9 2025")
                    .setFont(regular).setFontSize(8).setFontColor(GRAY_500)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(0));
            doc.add(new Paragraph("Dicetak pada: " + LocalDateTime.now().format(fmtCetak))
                    .setFont(regular).setFontSize(8).setFontColor(GRAY_500)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat PDF: " + e.getMessage(), e);
        }
    }

    private Cell createDataCell(String text, PdfFont font, DeviceRgb bg, TextAlignment align) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(9))
                .setBackgroundColor(bg).setPadding(5)
                .setTextAlignment(align);
    }

    // ═══════════════════════════════════════════════
    //             EXPORT EXCEL (Apache POI)
    // ═══════════════════════════════════════════════
    public byte[] exportExcel(LocalDate tanggal, Long penyuplaiId) {
        LaporanHarianResponse laporan = getLaporanHarian(tanggal, penyuplaiId);
        String namaPenyuplai = resolvePenyuplaiName(penyuplaiId);
        DateTimeFormatter fmtTanggal = DateTimeFormatter.ofPattern("dd MMMM yyyy", new Locale("id", "ID"));

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // ── Warna ──
            byte[] indigoBytes = {(byte) 67, (byte) 56, (byte) 202};
            byte[] whiteBytes = {(byte) 255, (byte) 255, (byte) 255};
            byte[] grayBytes = {(byte) 243, (byte) 244, (byte) 246};
            byte[] yellowBytes = {(byte) 254, (byte) 249, (byte) 195};

            XSSFColor indigoColor = new XSSFColor(indigoBytes, null);
            XSSFColor whiteColor = new XSSFColor(whiteBytes, null);
            XSSFColor grayColor = new XSSFColor(grayBytes, null);
            XSSFColor yellowColor = new XSSFColor(yellowBytes, null);

            // ── Styles ──

            // Judul toko (row 1)
            XSSFCellStyle titleStyle = wb.createCellStyle();
            XSSFFont titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(whiteColor);
            titleStyle.setFont(titleFont);
            titleStyle.setFillForegroundColor(indigoColor);
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Sub judul (row 2)
            XSSFCellStyle subTitleStyle = wb.createCellStyle();
            XSSFFont subTitleFont = wb.createFont();
            subTitleFont.setItalic(true);
            subTitleFont.setFontHeightInPoints((short) 12);
            subTitleStyle.setFont(subTitleFont);
            subTitleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Alamat (row 3)
            XSSFCellStyle addrStyle = wb.createCellStyle();
            XSSFFont addrFont = wb.createFont();
            addrFont.setFontHeightInPoints((short) 10);
            addrStyle.setFont(addrFont);
            addrStyle.setAlignment(HorizontalAlignment.CENTER);

            // Lap harian title (row 5)
            XSSFCellStyle lapTitleStyle = wb.createCellStyle();
            XSSFFont lapTitleFont = wb.createFont();
            lapTitleFont.setBold(true);
            lapTitleFont.setFontHeightInPoints((short) 12);
            lapTitleStyle.setFont(lapTitleFont);
            lapTitleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Penyuplai info (row 6)
            XSSFCellStyle infoStyle = wb.createCellStyle();
            XSSFFont infoFont = wb.createFont();
            infoFont.setFontHeightInPoints((short) 10);
            infoStyle.setFont(infoFont);
            infoStyle.setAlignment(HorizontalAlignment.CENTER);

            // Section header (e.g. "BARANG MASUK")
            XSSFCellStyle sectionStyle = wb.createCellStyle();
            XSSFFont sectionFont = wb.createFont();
            sectionFont.setBold(true);
            sectionFont.setFontHeightInPoints((short) 11);
            sectionStyle.setFont(sectionFont);
            sectionStyle.setFillForegroundColor(yellowColor);
            sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            sectionStyle.setAlignment(HorizontalAlignment.LEFT);

            // Table header
            XSSFCellStyle tblHeaderStyle = wb.createCellStyle();
            XSSFFont tblHeaderFont = wb.createFont();
            tblHeaderFont.setBold(true);
            tblHeaderFont.setFontHeightInPoints((short) 10);
            tblHeaderFont.setColor(whiteColor);
            tblHeaderStyle.setFont(tblHeaderFont);
            tblHeaderStyle.setFillForegroundColor(indigoColor);
            tblHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            tblHeaderStyle.setAlignment(HorizontalAlignment.CENTER);
            tblHeaderStyle.setBorderBottom(BorderStyle.THIN);
            tblHeaderStyle.setBorderTop(BorderStyle.THIN);

            // Data row white
            XSSFCellStyle dataWhite = wb.createCellStyle();
            dataWhite.setFillForegroundColor(whiteColor);
            dataWhite.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            dataWhite.setBorderBottom(BorderStyle.THIN);
            dataWhite.setBorderTop(BorderStyle.THIN);
            dataWhite.setBorderLeft(BorderStyle.THIN);
            dataWhite.setBorderRight(BorderStyle.THIN);

            // Data row gray (striped)
            XSSFCellStyle dataGray = wb.createCellStyle();
            dataGray.setFillForegroundColor(grayColor);
            dataGray.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            dataGray.setBorderBottom(BorderStyle.THIN);
            dataGray.setBorderTop(BorderStyle.THIN);
            dataGray.setBorderLeft(BorderStyle.THIN);
            dataGray.setBorderRight(BorderStyle.THIN);

            // Total row
            XSSFCellStyle totalStyle = wb.createCellStyle();
            XSSFFont totalFont = wb.createFont();
            totalFont.setBold(true);
            totalFont.setFontHeightInPoints((short) 10);
            totalStyle.setFont(totalFont);
            totalStyle.setBorderBottom(BorderStyle.MEDIUM);
            totalStyle.setBorderTop(BorderStyle.MEDIUM);

            // Map barangId -> satuan
            Map<Long, String> satuanMap = new HashMap<>();
            if (laporan.getRekapBarang() != null) {
                laporan.getRekapBarang().forEach(r -> satuanMap.put(r.getBarangId(), r.getSatuan()));
            }

            // ════════════════════════════
            //  SHEET 1 — Laporan Harian
            // ════════════════════════════
            XSSFSheet sheet1 = wb.createSheet("Laporan Harian");
            int cols = 4; // No, Nama Barang, Jumlah, Satuan

            int rowIdx = 0;
            // Row 1: Nama Toko
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row r1 = sheet1.createRow(rowIdx++);
            r1.setHeightInPoints(30);
            org.apache.poi.ss.usermodel.Cell c1 = r1.createCell(0);
            c1.setCellValue("TOKO AGAR D.A.");
            c1.setCellStyle(titleStyle);

            // Row 2: Sub judul
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row r2 = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell c2 = r2.createCell(0);
            c2.setCellValue("Sistem Informasi Manajemen Inventori");
            c2.setCellStyle(subTitleStyle);

            // Row 3: Alamat
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row r3 = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell c3 = r3.createCell(0);
            c3.setCellValue("Jl. Raya Cibogo, Plered, Purwakarta, Jawa Barat");
            c3.setCellStyle(addrStyle);

            // Row 4: Kosong
            rowIdx++;

            // Row 5: Laporan Harian - Tanggal
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row r5 = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell c5 = r5.createCell(0);
            c5.setCellValue("LAPORAN HARIAN - " + tanggal.format(fmtTanggal));
            c5.setCellStyle(lapTitleStyle);

            // Row 6: Penyuplai
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row r6 = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell c6 = r6.createCell(0);
            c6.setCellValue("Penyuplai: " + namaPenyuplai);
            c6.setCellStyle(infoStyle);

            // Row 7: Kosong
            rowIdx++;

            // ── Tabel Barang Masuk ──
            // Section header
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row secMasuk = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell secMasukCell = secMasuk.createCell(0);
            secMasukCell.setCellValue("BARANG MASUK");
            secMasukCell.setCellStyle(sectionStyle);

            // Table header
            Row hdrRowMasuk = sheet1.createRow(rowIdx++);
            String[] headersMasuk = {"No", "Nama Barang", "Jumlah", "Satuan"};
            for (int i = 0; i < headersMasuk.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = hdrRowMasuk.createCell(i);
                cell.setCellValue(headersMasuk[i]);
                cell.setCellStyle(tblHeaderStyle);
            }

            // Data rows
            int no = 1;
            for (TransaksiMasukResponse t : laporan.getTransaksiMasuk()) {
                Row dataRow = sheet1.createRow(rowIdx++);
                XSSFCellStyle style = (no % 2 == 0) ? dataGray : dataWhite;
                String satuan = satuanMap.getOrDefault(t.getBarangId(), "-");

                createExcelCell(dataRow, 0, String.valueOf(no++), style);
                createExcelCell(dataRow, 1, t.getNamaBarang(), style);
                createExcelCell(dataRow, 2, String.valueOf(t.getJumlah()), style);
                createExcelCell(dataRow, 3, satuan, style);
            }

            // Total row
            Row totalMasukRow = sheet1.createRow(rowIdx++);
            createExcelCell(totalMasukRow, 0, "", totalStyle);
            createExcelCell(totalMasukRow, 1, "Total Masuk", totalStyle);
            createExcelCell(totalMasukRow, 2, String.valueOf(laporan.getTotalMasuk()), totalStyle);
            createExcelCell(totalMasukRow, 3, "", totalStyle);

            // Kosong
            rowIdx++;

            // ── Tabel Barang Keluar (grouped per barang) ──
            sheet1.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, cols - 1));
            Row secKeluar = sheet1.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell secKeluarCell = secKeluar.createCell(0);
            secKeluarCell.setCellValue("BARANG KELUAR (Dikelompokkan per Barang)");
            secKeluarCell.setCellStyle(sectionStyle);

            Row hdrRowKeluar = sheet1.createRow(rowIdx++);
            for (int i = 0; i < headersMasuk.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = hdrRowKeluar.createCell(i);
                cell.setCellValue(headersMasuk[i]);
                cell.setCellStyle(tblHeaderStyle);
            }

            no = 1;
            List<BarangLaporanSummary> keluarItems = laporan.getRekapBarang() != null
                    ? laporan.getRekapBarang().stream().filter(r -> r.getTotalKeluar() > 0).collect(Collectors.toList())
                    : Collections.emptyList();

            for (BarangLaporanSummary item : keluarItems) {
                Row dataRow = sheet1.createRow(rowIdx++);
                XSSFCellStyle style = (no % 2 == 0) ? dataGray : dataWhite;
                createExcelCell(dataRow, 0, String.valueOf(no++), style);
                createExcelCell(dataRow, 1, item.getNamaBarang(), style);
                createExcelCell(dataRow, 2, String.valueOf(item.getTotalKeluar()), style);
                createExcelCell(dataRow, 3, item.getSatuan(), style);
            }

            Row totalKeluarRow = sheet1.createRow(rowIdx++);
            createExcelCell(totalKeluarRow, 0, "", totalStyle);
            createExcelCell(totalKeluarRow, 1, "Total Keluar", totalStyle);
            createExcelCell(totalKeluarRow, 2, String.valueOf(laporan.getTotalKeluar()), totalStyle);
            createExcelCell(totalKeluarRow, 3, "", totalStyle);

            // Auto-size columns
            for (int i = 0; i < cols; i++) sheet1.autoSizeColumn(i);
            // Set minimum widths
            if (sheet1.getColumnWidth(1) < 8000) sheet1.setColumnWidth(1, 8000);

            // ════════════════════════════
            //  SHEET 2 — Ringkasan
            // ════════════════════════════
            XSSFSheet sheet2 = wb.createSheet("Ringkasan");
            int cols2 = 6;

            int ri = 0;
            // Header
            sheet2.addMergedRegion(new CellRangeAddress(ri, ri, 0, cols2 - 1));
            Row rs1 = sheet2.createRow(ri++);
            rs1.setHeightInPoints(28);
            org.apache.poi.ss.usermodel.Cell rs1c = rs1.createCell(0);
            rs1c.setCellValue("TOKO AGAR D.A.");
            rs1c.setCellStyle(titleStyle);

            sheet2.addMergedRegion(new CellRangeAddress(ri, ri, 0, cols2 - 1));
            Row rs2 = sheet2.createRow(ri++);
            org.apache.poi.ss.usermodel.Cell rs2c = rs2.createCell(0);
            rs2c.setCellValue("Ringkasan Laporan Harian - " + tanggal.format(fmtTanggal));
            rs2c.setCellStyle(lapTitleStyle);

            sheet2.addMergedRegion(new CellRangeAddress(ri, ri, 0, cols2 - 1));
            Row rs3 = sheet2.createRow(ri++);
            org.apache.poi.ss.usermodel.Cell rs3c = rs3.createCell(0);
            rs3c.setCellValue("Penyuplai: " + namaPenyuplai);
            rs3c.setCellStyle(infoStyle);

            ri++; // kosong

            // Ringkasan table header
            Row ringkasanHdr = sheet2.createRow(ri++);
            String[] rhdr = {"No", "Nama Barang", "Masuk", "Keluar", "Sisa Stok", "Satuan"};
            for (int i = 0; i < rhdr.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = ringkasanHdr.createCell(i);
                cell.setCellValue(rhdr[i]);
                cell.setCellStyle(tblHeaderStyle);
            }

            if (laporan.getRekapBarang() != null) {
                no = 1;
                for (BarangLaporanSummary item : laporan.getRekapBarang()) {
                    Row dataRow = sheet2.createRow(ri++);
                    XSSFCellStyle style = (no % 2 == 0) ? dataGray : dataWhite;
                    createExcelCell(dataRow, 0, String.valueOf(no++), style);
                    createExcelCell(dataRow, 1, item.getNamaBarang(), style);
                    createExcelCell(dataRow, 2, String.valueOf(item.getTotalMasuk()), style);
                    createExcelCell(dataRow, 3, String.valueOf(item.getTotalKeluar()), style);
                    createExcelCell(dataRow, 4, String.valueOf(item.getStokSaatIni()), style);
                    createExcelCell(dataRow, 5, item.getSatuan(), style);
                }
            }

            // Total
            Row ringkasanTotal = sheet2.createRow(ri++);
            createExcelCell(ringkasanTotal, 0, "", totalStyle);
            createExcelCell(ringkasanTotal, 1, "TOTAL", totalStyle);
            createExcelCell(ringkasanTotal, 2, String.valueOf(laporan.getTotalMasuk()), totalStyle);
            createExcelCell(ringkasanTotal, 3, String.valueOf(laporan.getTotalKeluar()), totalStyle);
            createExcelCell(ringkasanTotal, 4, "", totalStyle);
            createExcelCell(ringkasanTotal, 5, "", totalStyle);

            for (int i = 0; i < cols2; i++) sheet2.autoSizeColumn(i);
            if (sheet2.getColumnWidth(1) < 8000) sheet2.setColumnWidth(1, 8000);

            wb.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat Excel: " + e.getMessage(), e);
        }
    }

    private void createExcelCell(Row row, int col, String value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    // ═══════════════════════════════════════════════
    //                RIWAYAT
    // ═══════════════════════════════════════════════
    public List<TransaksiMasukResponse> getRiwayatMasuk(LocalDate tanggalMulai, LocalDate tanggalAkhir) {
        LocalDateTime start = tanggalMulai.atStartOfDay();
        LocalDateTime end = tanggalAkhir.atTime(LocalTime.MAX);

        return transaksiMasukRepository.findByTanggalMasukBetween(start, end).stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransaksiKeluarResponse> getRiwayatKeluar(LocalDate tanggalMulai, LocalDate tanggalAkhir) {
        LocalDateTime start = tanggalMulai.atStartOfDay();
        LocalDateTime end = tanggalAkhir.atTime(LocalTime.MAX);

        return transaksiKeluarRepository.findByTanggalKeluarBetween(start, end).stream()
                .map(transaksiKeluarService::toResponse)
                .collect(Collectors.toList());
    }
}
