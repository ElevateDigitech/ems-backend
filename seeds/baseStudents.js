const baseStudents = [
  {
    Enrollment_Id: "TVA21010007",
    Name: "ADHVIKA JEEVANANDAN",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA22020128",
    Name: "ADITI MEGHAL.T",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA22020107",
    Name: "ARHYA.S.P",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA23030012",
    Name: "GUGASENTH.R.N",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010099",
    Name: "GUHAN.R",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010027",
    Name: "HARSHANTH.M",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010034",
    Name: "KAMALI.R",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010037",
    Name: "KANYA.S",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010038",
    Name: "KAVIYAASH.C.S",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA24040001",
    Name: "KAYAL VAINNAVI D",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA22020122",
    Name: "KRISHVIKASHREE.D.M",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA22020097",
    Name: "MAGIZHAN.A",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010052",
    Name: "NILAANI.M.R",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010061",
    Name: "RITTHUSHA.R",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010065",
    Name: "RUDRA.V.K",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA24040002",
    Name: "SHAKKSHENI N D",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010070",
    Name: "SHEVALINI.D.S",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010074",
    Name: "SUBIN.S.S",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010094",
    Name: "TANVIKH ARYA.S",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA22020110",
    Name: "THANVI ANISHKUMAR",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA21010077",
    Name: "THIRUKUMARAN.V.A",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA23030014",
    Name: "VEDHA.V",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA24040007",
    Name: "VIDHULA P P",
    Class: "1A",
  },
  {
    Enrollment_Id: "TVA23030008",
    Name: "AADHAV.G",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA22020115",
    Name: "ADHVIK.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010008",
    Name: "ADITI.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010035",
    Name: "KANALI KARTHIK",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010036",
    Name: "KANMANI SREE.P.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010039",
    Name: "KAVIYAN.R",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010089",
    Name: "KRISHIV.G",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010095",
    Name: "LAKSHITHA.N.P",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010044",
    Name: "LAYATHIKA.M",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010046",
    Name: "MAHATHI SRI.A.P",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA23030002",
    Name: "MAHILAN.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA23030003",
    Name: "MITHRAN.R.I",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA22020120",
    Name: "NAGUL ATHITHYA",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA24040003",
    Name: "NAINIKA SRI J",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010051",
    Name: "NIGAZHINI.M",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010056",
    Name: "PRAJITH.P",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010087",
    Name: "PUGAZH.N.R",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010069",
    Name: "SATYARTH.S.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA22010048",
    Name: "SIVA MITHRAN.G.V",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA22020138",
    Name: "THIGAZHOVIYAN JANARTHANAN",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010082",
    Name: "VIHAANA.Y.S",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA22020135",
    Name: "VIPIKSHAA PRAKASH",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA21010083",
    Name: "VITHURAN.H",
    Class: "1B",
  },
  {
    Enrollment_Id: "TVA23030013",
    Name: "AADHIRA.P",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020106",
    Name: "AARIYEN.S",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010005",
    Name: "AARUDHRANN.D",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010009",
    Name: "ADITI.B",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010010",
    Name: "AEGAN KANKEYAN",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010012",
    Name: "ANIRUDH.J.S",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA24040005",
    Name: "CHADDURVANA M.P",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA23030005",
    Name: "DEVAKANYA.P.P",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010025",
    Name: "HARIPRANAV.E",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020127",
    Name: "KRITHAY SAMPATHKUMAR",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020113",
    Name: "LAYAA.K",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020133",
    Name: "MAHIZHINI.K.D",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020130",
    Name: "NANDEKESH.A",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020103",
    Name: "NETHRA.R.P",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010057",
    Name: "PRANIK.K.S",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010064",
    Name: "RUDHVIN.M.P",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020101",
    Name: "SASTTIKA.M",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010072",
    Name: "SPOORTHI.D",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010073",
    Name: "SRI MEENAKSHI.D",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020096",
    Name: "SUTHISH.N",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020116",
    Name: "TAMIL.J.G",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA22020123",
    Name: "YADVI.V",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA21010086",
    Name: "YUKTHA RAVI KARTHIKEYAN",
    Class: "1C",
  },
  {
    Enrollment_Id: "TVA23030007",
    Name: "AARURAN.A.K",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010096",
    Name: "AATHIRAI.K.K",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010006",
    Name: "ADHVIK.M",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010013",
    Name: "ASHVAND.J.M",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010015",
    Name: "AVYAAN MISHRA",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010019",
    Name: "DHANVI.R",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010021",
    Name: "DHARMIG.L",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA23030006",
    Name: "GNAZHAL.P",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010028",
    Name: "HIMAASHRI RUKMANI DHEVI.V.A",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA24040004",
    Name: "INIYA S G",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010043",
    Name: "LAKSIDHAA.P.T",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22020125",
    Name: "MITHRAA.T",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010048",
    Name: "MITHRAN.D",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010097",
    Name: "PRATHISTAA.G",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22010045",
    Name: "RENEISH AARYA.N.M",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010062",
    Name: "RONITH",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010067",
    Name: "SASMITH.K",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22020129",
    Name: "SUGANTHAN.P.M",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22020134",
    Name: "TEJASWINI.M.D",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010076",
    Name: "THANVI.P.S",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010079",
    Name: "UTTHAM VELAPAN.V",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA21010085",
    Name: "YOHA.S.B",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22020114",
    Name: "YUVAN.S.A",
    Class: "1D",
  },
  {
    Enrollment_Id: "TVA22020131",
    Name: "AADITH.D",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010003",
    Name: "AARAW.G",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA23030009",
    Name: "AATHIRA.K.V",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA23030001",
    Name: "ADITI.S",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010011",
    Name: "AKSARAA.G",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010022",
    Name: "DHIYA.J.K",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010023",
    Name: "DHIYAASH.J.K",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA23030010",
    Name: "EDHAZHYA.P",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010029",
    Name: "IDHALL ANNVI.M.G",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010031",
    Name: "INITHRA.G.B",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020137",
    Name: "MAGIZHAN.A",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010047",
    Name: "MAHIZHAN EVERAA.K",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020117",
    Name: "MUTHUKUZHALAN.S.J",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020121",
    Name: "NAIRUTHI RAMKUMAR",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020104",
    Name: "PONTHAMARAIYAL.A.K",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020136",
    Name: "PRANAV VARSHAN.D",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020119",
    Name: "RAAMVIYAN.K.V",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA21010058",
    Name: "RAGULAN.S",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020118",
    Name: "SASHTI.S.S",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020126",
    Name: "SENTHALIR.P",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA22020112",
    Name: "SRINIHA.M",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA24040006",
    Name: "THIRUKKUMARAN A",
    Class: "1E",
  },
  {
    Enrollment_Id: "TVA20010002",
    Name: "AADHIRAII P. S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010003",
    Name: "AADHITYA SREE.S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010005",
    Name: "AARAV S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA21010004",
    Name: "AARUDHRA S. M",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA24050006",
    Name: "ADHIRA V T",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA24050011",
    Name: "DDHRUVV CHORARIA",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010022",
    Name: "DHIYANATHI M",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010023",
    Name: "ELANA N. S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA24050003",
    Name: "KABHILAN S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010028",
    Name: "KAVI INBA E. P",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010029",
    Name: "KAVI PRANAV T",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010032",
    Name: "KRISHNAV M",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010044",
    Name: "MUKUNTH K",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010046",
    Name: "NAINIKA SHREE R. D",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010051",
    Name: "NITHARSANA B",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA22030135",
    Name: "RISHIKESH V",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA22030136",
    Name: "RITHVIK V",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA21020107",
    Name: "SAATHVIK J",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010065",
    Name: "SARNITH K",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010076",
    Name: "THARUN SARVIN J",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA23040004",
    Name: "UMAIYAL K S",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010079",
    Name: "VEDHAV M. R",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010080",
    Name: "VENBA M",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010091",
    Name: "YATHVI.S.M",
    Class: "2A",
  },
  {
    Enrollment_Id: "TVA20010001",
    Name: "ABIMANU S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010008",
    Name: "ABINANDAN.M.P",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010010",
    Name: "ADITI V. P",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010019",
    Name: "DHANVIN P. R",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA21030120",
    Name: "DHANYAMITHIRA S. T",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA24050009",
    Name: "INIYAN ARUN S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010027",
    Name: "JAMILA I",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010030",
    Name: "KIRUTHIK AMIRTHAN M",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010031",
    Name: "KISHA S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA21030123",
    Name: "KRISHVANTH P",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA21020105",
    Name: "MAKIZHAN S. K",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010043",
    Name: "MOHITHA K. S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010092",
    Name: "NAVAYUKA K P",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA24050010",
    Name: "NITHILAN R S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010053",
    Name: "PARIKSHITH S",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010058",
    Name: "PRAHANYA G",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA23040003",
    Name: "PRATHIKA PRABHU",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA21010066",
    Name: "SAI PRANILA T",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010064",
    Name: "SAIRAM G",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010068",
    Name: "SHREENAV S. K",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA21020108",
    Name: "THANMAYA N. M",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010077",
    Name: "THUKI A. R",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010085",
    Name: "VISAHAN J",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA20010089",
    Name: "YAAZHISAI.K.V",
    Class: "2B",
  },
  {
    Enrollment_Id: "TVA24050004",
    Name: "ADHIDHA K",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA21030125",
    Name: "ADHIRAI R",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010009",
    Name: "ADHVIK SATHISH",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA21030122",
    Name: "AKILAN C",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010015",
    Name: "ARYAN R. S",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010016",
    Name: "ASMITHA.M",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010024",
    Name: "HANISHA B",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA24050002",
    Name: "ISHAI RAPHEAL",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010035",
    Name: "KRITIVV J",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010038",
    Name: "MAGIZHAN D",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010040",
    Name: "MAGIZHINI S. K",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA21030119",
    Name: "MATHUKSSHARA SRI S. N",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010042",
    Name: "MEGHNA A",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010045",
    Name: "NAGULAN S",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA23040002",
    Name: "NALAN KARTHICK",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA24050007",
    Name: "NALAN S A",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010052",
    Name: "NITHYAHASSINI R. T",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010059",
    Name: "PRANEETH GURUBARAN P. R",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA21020097",
    Name: "PUGALINI B. G",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010066",
    Name: "SHASTI PUGAL R. S",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010072",
    Name: "SRI IYENIYAN A. V",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010074",
    Name: "SRINETHELLA S J",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA23040005",
    Name: "SUBHIKSHA H",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA23040006",
    Name: "YADHAVI SHANMUGARAJ",
    Class: "2C",
  },
  {
    Enrollment_Id: "TVA20010004",
    Name: "AADVIK A .P",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA22030130",
    Name: "AARUTHRAN BOOPATHY",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA24050001",
    Name: "ADHVIK MATHIYARASU",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010011",
    Name: "ADVIKA.B.J",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA22030129",
    Name: "ANU PRITHUVIKA B",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010013",
    Name: "ANVITHA S. D",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010017",
    Name: "BUVAN K. R",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA21020102",
    Name: "CHEZHIYAN M",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA24050005",
    Name: "CHEZHIYAVEL G",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA21020101",
    Name: "EZHILAN M",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010036",
    Name: "LAKSHNA K",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010095",
    Name: "MAHILA SREE S",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010094",
    Name: "MOHAMED REHAN M",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010047",
    Name: "NAYOMIKA VIVEK",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010048",
    Name: "NEGHAA S",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010049",
    Name: "NILA S.K",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010056",
    Name: "PON SANJEEVAN P",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA24050008",
    Name: "SAANVE GOKUL PRASATH",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA22030127",
    Name: "TANUTHKRISHNA M.S",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010075",
    Name: "TARUN VIGASH N",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA21010078",
    Name: "TUKIRA Y. V",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA22030132",
    Name: "VETRIVEL GOWRISHANKAR",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA20010083",
    Name: "VIDHYUTH SARWIN A",
    Class: "2D",
  },
  {
    Enrollment_Id: "TVA19010093",
    Name: "ADHIRA.J",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA23050004",
    Name: "AHMAD ZAMAN",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010002",
    Name: "ARADHANA.M",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010014",
    Name: "DAKSHA.S.M",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA20020101",
    Name: "DEEPSHIKA ARUL",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010022",
    Name: "HASVITH KUMARAN.N",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010023",
    Name: "IDHAYASREE.S.K",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010025",
    Name: "IYAL.M",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA22040113",
    Name: "JANAVARSHINI E D",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA23050003",
    Name: "KAVINI S",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA22040105",
    Name: "KAVINILAA .S",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010029",
    Name: "KOWSIK.P.S",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA24060001",
    Name: "MOGITH PA",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010040",
    Name: "NAVILAN.T",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010043",
    Name: "NITHILAN.K",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010054",
    Name: "SAKA VISAKEN.P.D",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010055",
    Name: "SAKHI VIDHURRNA.P.D",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010069",
    Name: "TAMIZH AZHAAGAN.A.S",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA20020104",
    Name: "TEAJA A.Y",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010075",
    Name: "UTHIYAN SIVAM.P.S",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010078",
    Name: "VAISNAV.A",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010080",
    Name: "VARSHA.A",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010084",
    Name: "VISHNU SIDDHARTH.G",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA19010085",
    Name: "VITHUN.D.R",
    Class: "3A",
  },
  {
    Enrollment_Id: "TVA21030117",
    Name: "AADVIK DURAIMURUGAN",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA18010019",
    Name: "ATHARVA VIVEK",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010016",
    Name: "DHANSHITHA.A.R",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010017",
    Name: "DHIVIN K G",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010028",
    Name: "KAYILAN LINGAPPAN.A",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA20020099",
    Name: "KRITHIGAN.V",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA22040106",
    Name: "MITHRAN.E",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA23050007",
    Name: "PAGUMITHRAN N",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010045",
    Name: "PONYALINI.K",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010090",
    Name: "PRAKALYA.R.K",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA20020105",
    Name: "PRANAVASAKTHI.A",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010049",
    Name: "PRANAVIKA.A",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010060",
    Name: "SHIVIN.S",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010063",
    Name: "SHRI CHARAN.S.K",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010068",
    Name: "TAMILINIYAN.A.N",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010071",
    Name: "THANUSRI.R",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA22040107",
    Name: "THARAN KARTHIK",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010077",
    Name: "VAINAVISREE.S.S",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010079",
    Name: "VARNEKHASRI.P",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA23050005",
    Name: "VIDHUN R",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA21030112",
    Name: "VIKRUTHI RAMKUMAR",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010083",
    Name: "VISAKAN.D",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010086",
    Name: "VIYA.V",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010088",
    Name: "YUHA.R.P",
    Class: "3B",
  },
  {
    Enrollment_Id: "TVA19010001",
    Name: "AADRIKA.K",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA23050002",
    Name: "AATHVIGA SRI S R",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010091",
    Name: "ADHIRAI.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010012",
    Name: "BHOOMIDRA.S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA21030114",
    Name: "DHIKSHA P L",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010020",
    Name: "HARSHA PHRATHAA V.J",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010024",
    Name: "IMAYA.L.G",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010030",
    Name: "KRITHVIIK.R.S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA24060005",
    Name: "KUHAN A S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010032",
    Name: "MAGHITRA.S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA23050001",
    Name: "MAHADHEE P",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA22040102",
    Name: "MAHILVADHANI A S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010034",
    Name: "MAHIZHAN KARTHIK.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA20020106",
    Name: "MUTHUKAVISH.M.G",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010044",
    Name: "PON YAZHISAI.A.K",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010051",
    Name: "RISWANTH.K.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA24060002",
    Name: "RITHANYA SAKTHIVADIVEL",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010053",
    Name: "ROHIT.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA18010089",
    Name: "SANDHISH.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010057",
    Name: "SASHTII.V.M",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA22040103",
    Name: "SHANVIKAA.S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010062",
    Name: "SHRAVANESH KAUSHIK",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA23050006",
    Name: "SHREE AGHATIYAN V.S",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010064",
    Name: "SHRIMIRRA",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA19010065",
    Name: "SHRUTHI KAUSHIK",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA20020100",
    Name: "VIVAN.K",
    Class: "3C",
  },
  {
    Enrollment_Id: "TVA24060003",
    Name: "AAHIL S",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010011",
    Name: "AVYUKKT.A",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010015",
    Name: "DANISH.K.R",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA21030116",
    Name: "HARINI G S",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010021",
    Name: "HARSHAN.V.H",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010033",
    Name: "MAHATHI.K",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010035",
    Name: "MEGHA.A",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010038",
    Name: "MITULA.D",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010039",
    Name: "NATHIRA.K",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010041",
    Name: "NEHA NAVIN",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010047",
    Name: "PRAGATHI A.A",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA24060004",
    Name: "SAI NIHIL K",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010056",
    Name: "SANJAY K A",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010061",
    Name: "SHIVIN.R",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010066",
    Name: "SUJAY KIRAN.P",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010070",
    Name: "TARUN ESWAR.M.R",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA20020103",
    Name: "TRITHIKSAA SHRI.KN",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010073",
    Name: "UDIT.M",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010074",
    Name: "UMAIYAL K",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010076",
    Name: "VAIBHAVI.S",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010081",
    Name: "VARSHIKA.K",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA20020109",
    Name: "VIHAAN ARUNACHALAM.B",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA19010082",
    Name: "VISAKA MITHIRAN.K.R",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA20020102",
    Name: "YALINI THENDRAL T.S",
    Class: "3D",
  },
  {
    Enrollment_Id: "TVA18010008",
    Name: "ADVIKA.M",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010010",
    Name: "AJAI.S.G",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010017",
    Name: "ASHWANTH.S.P",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA23060003",
    Name: "HOVIYA K",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA20030087",
    Name: "KAVIYALNI.S",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010039",
    Name: "KIRUTHIK.R.P",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA22050106",
    Name: "KRISHIV RAJ.G.R",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA19020048",
    Name: "MITHUL PRANAV.C.V",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA20030091",
    Name: "MOHAMED FAAZIL SALMAN.K.M",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010051",
    Name: "MUTHU KRISHNAN.S",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010054",
    Name: "NITARSANA.R.P",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA20030089",
    Name: "NITHEEN.K",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA19020085",
    Name: "PAVIN.K",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA21040101",
    Name: "REYASHINI.S",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010061",
    Name: "RUTHRA.S",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010068",
    Name: "SHAAN.N",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010071",
    Name: "SHIVANI.S.G",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010076",
    Name: "THANVIKHA. J",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010077",
    Name: "THARUN NITHILAN.M",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA20030094",
    Name: "THEEKSHA.R.K",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010081",
    Name: "VIDULASAAI.S",
    Class: "4A",
  },
  {
    Enrollment_Id: "TVA18010011",
    Name: "AMRITHAA.M",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010016",
    Name: "ASHMITHA.K",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA21040098",
    Name: "ASWIN SIDARTH.E",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010020",
    Name: "AWINYAA.D.S",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010026",
    Name: "EZHIL P K INIYAN",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010032",
    Name: "INIYAN ANGAMUTHU.K",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010033",
    Name: "ISHWARYA VENDHAN",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA19020038",
    Name: "KIRUTHIK PRABHU.A.S",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010040",
    Name: "KRISHVVIN.S.S",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA20030096",
    Name: "KRITHIN.J",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010041",
    Name: "KRITHISH.M",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA20030090",
    Name: "LOGHAMITHRAN.S.K",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA21040103",
    Name: "MIRITHYUNJAI.T",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18020041",
    Name: "RAAGAV SAAI KRISHNA.V.A",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010058",
    Name: "RIYATANISHKA.V",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010060",
    Name: "ROOPA SRI.S.P",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA17010048",
    Name: "SAGASHRA.U.P",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010072",
    Name: "SHRIMUKHI.G.M",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010075",
    Name: "THANVIKA.M.D",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010078",
    Name: "TRISHIKA.K",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010082",
    Name: "VISHWAKRISHNAA.K.V",
    Class: "4B",
  },
  {
    Enrollment_Id: "TVA18010001",
    Name: "AARAV SHIVIESH. A",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010004",
    Name: "ACKSSARA SRRI. V.G",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010015",
    Name: "ANVITHA. P",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010018",
    Name: "ASWATH. S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA19020021",
    Name: "BIVIN.K.R",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010022",
    Name: "DHAKSHA. S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA20030093",
    Name: "HANISH.M",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA21040104",
    Name: "HANSHIGA.S.V",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010029",
    Name: "HARSHATH. D",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA17010016",
    Name: "HARSHITH. M",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010043",
    Name: "MAGIZHAN. G.S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010044",
    Name: "MAHIZH. A.V",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA24070003",
    Name: "NIRALYA R",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA24070002",
    Name: "PRAGYA VIKRAM",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010056",
    Name: "RAAGHAVI. J.K",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA19020063",
    Name: "SAHITHYA.S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010065",
    Name: "SAMIRA. P.S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010066",
    Name: "SANJEEV. S.M",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010069",
    Name: "SHARVA KIRTHIK. A.K.S",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA24070001",
    Name: "YAAZHINI V",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010083",
    Name: "YUVAN.K",
    Class: "4C",
  },
  {
    Enrollment_Id: "TVA18010003",
    Name: "AARYAN. K.K",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010005",
    Name: "ADHITI. S",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010007",
    Name: "ADVAITHA. Y",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010009",
    Name: "AISSHWARYAA. M.D",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA21040105",
    Name: "ARULNITHIVEL K K",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010025",
    Name: "DHASHWINTH. ER",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA22050109",
    Name: "HARITHRA .S.P",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010030",
    Name: "HARSHAVAARDANA. S",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010035",
    Name: "JANVI JAGADEESH",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010037",
    Name: "KABEESH. T.U",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA23060004",
    Name: "KAVINMUGIL A",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010045",
    Name: "MAHIZHINI. A",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA19020047",
    Name: "MEVISH.G.V",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010052",
    Name: "NAVARETHIK. M.J",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA23060001",
    Name: "PAVISHKA M J",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010059",
    Name: "ROHAN. M",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA21040097",
    Name: "SRIMIDHULA.A",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA19020073",
    Name: "SRIVARSHAN.V.U",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010074",
    Name: "TANVI. J",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA18010080",
    Name: "VAISHARA. S",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA22050110",
    Name: "VIRTHIKSHA.S",
    Class: "4D",
  },
  {
    Enrollment_Id: "TVA19030078",
    Name: "ADHAV .S.N",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA23070003",
    Name: "AMITA.S",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010009",
    Name: "ASHRUTHA. J.M",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010014",
    Name: "GOKULRAJA. S.P",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010020",
    Name: "KABILAA. M",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010024",
    Name: "KEERTHANYA. S",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010032",
    Name: "MOHETH. R.M",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA18020037",
    Name: "PAVANGURU. P",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010038",
    Name: "PRABHANCHANA. S.G",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010042",
    Name: "RAJ KAVIN RAJA. N.P",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010043",
    Name: "RASMIKA. N.P",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010049",
    Name: "SAKTHI SHIVANI. R",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010051",
    Name: "SARVESH. K",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010057",
    Name: "SHRUTHI. D",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010058",
    Name: "SHUVI MISHRA",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA18020059",
    Name: "SIVA KARTHI. K",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA21050083",
    Name: "SMIRITHII S S",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA22060002",
    Name: "TARA S KARUNAGARAN",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA18020070",
    Name: "VEDHA. S",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA20040079",
    Name: "VISHWAK JP",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA21050081",
    Name: "YALVAN P K",
    Class: "5A",
  },
  {
    Enrollment_Id: "TVA17010015",
    Name: "AGILAN.V.S",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA18020007",
    Name: "AKHSHAYA. P",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA19030074",
    Name: "ARAVINDKRISHNA.S",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA18020019",
    Name: "JEEVITH SAI. B.S",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA22060003",
    Name: "KARMYAA KARTHIK",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA23070001",
    Name: "KIRUTHIK VAIBHAV T K",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA18020026",
    Name: "KRISHAV.A",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA19030077",
    Name: "LAKSHANA.S",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010028",
    Name: "MAGIZH CIBIRAJ",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010029",
    Name: "MEHA R V",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010035",
    Name: "MUGUNTH. R.V",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010040",
    Name: "PRIYADHARSHINI. S",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA22060004",
    Name: "RAGHAVI GOWRISHANKAR",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010044",
    Name: "RITHAN KIRUTHIK. T",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010050",
    Name: "SARAH. B",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010054",
    Name: "SASTHIKA. T",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA19030075",
    Name: "SHAIVERITHIKA.D",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010062",
    Name: "SUBISHANTH. K",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010069",
    Name: "VARUNI. G",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010072",
    Name: "VIDHYUTHH. D",
    Class: "5B",
  },
  {
    Enrollment_Id: "TVA17010001",
    Name: "AADHIRA. A",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010003",
    Name: "ADHITHII. N",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010004",
    Name: "ADIRAI. M",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010006",
    Name: "AKAN. A",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA22060001",
    Name: "AMRRESH.P.S",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010010",
    Name: "DARSHANA. R",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA19030076",
    Name: "DHISHA.J.S",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA21050084",
    Name: "KANALIGHAI PRITHIEV",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA18010046",
    Name: "MEGHNA. V.M",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA22060005",
    Name: "MIRUDHULA G R",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010031",
    Name: "MITHUN. M.P",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010036",
    Name: "NIRALYA. T",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA24080001",
    Name: "RITHIKK K",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA18020046",
    Name: "RITHISH. M.G",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA23070002",
    Name: "RITHWIK R I",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010047",
    Name: "ROKITH S P",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010053",
    Name: "SARVESH. S",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010060",
    Name: "SIVA SARVESH. S.S",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010061",
    Name: "SUBHIKSHA. M",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA18020063",
    Name: "SUCHITHRA. G",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010066",
    Name: "THEERAN. S.M",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA17010071",
    Name: "VENBA. G.S",
    Class: "5C",
  },
  {
    Enrollment_Id: "TVA16010002",
    Name: "AADITH. J.R",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA18030006",
    Name: "AISHWARYA.S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA22070001",
    Name: "AKASTHIYA PRAKASH",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA19040049",
    Name: "ARIVAN. KA.NA",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010010",
    Name: "ASWANTH. S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010015",
    Name: "ELANCHEZHIYAN. S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010016",
    Name: "GURU PREYAN. N.V",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010024",
    Name: "LISANTH. G.K",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA17020025",
    Name: "MAHATHI. I.R",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA20050053",
    Name: "MUTHUKUMARAN K K",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA17020030",
    Name: "NIKSHITHA. M.K",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010031",
    Name: "PAVISHNA. P.M",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA23080001",
    Name: "RISHHI VIJAY OMHARAN",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010036",
    Name: "SAHASRA. S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010037",
    Name: "SASHWARTH SAI. G.M",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA18030040",
    Name: "SIDDHARTH.V.R",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010038",
    Name: "SRI AHILAN. R",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010041",
    Name: "SRI HARSHITHA. S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA19040043",
    Name: "SUGAVARSINI.A",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA22070002",
    Name: "THANISKA.P.S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010044",
    Name: "THARUN. S",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA19040047",
    Name: "YAADHAV.M",
    Class: "6A",
  },
  {
    Enrollment_Id: "TVA16010001",
    Name: "AADHITH SUBRAMANYAM. K",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010004",
    Name: "ABHINAV. R",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010007",
    Name: "AKSHAYAA. G",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010008",
    Name: "ANIRUTH. M.M",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010009",
    Name: "ASHWANTH RAM. M",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010012",
    Name: "BHARATHI. K",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA17020014",
    Name: "ELAKSHATHA. S",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA19040017",
    Name: "GURU SURIYA.V",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA17020018",
    Name: "HANUSREE. A",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA18030019",
    Name: "HARISH.P",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA17010021",
    Name: "KAPILAN ANNAAMALAI. K",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA19040023",
    Name: "LIKHITH.S",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA19040048",
    Name: "MIRRTHULA.S.P",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA17020027",
    Name: "MITHRA. K",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA22070005",
    Name: "RAGHUNANDAN SIVARAMAN",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010035",
    Name: "SACHIN. B.D",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA24090001",
    Name: "SHRINITHILA V",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA21060054",
    Name: "SRILAYA S P",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010045",
    Name: "VAIBHAVI. S.M",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA16010046",
    Name: "VISWAK SATHISH",
    Class: "6B",
  },
  {
    Enrollment_Id: "TVA19050028",
    Name: "ACHYUT.G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA19060033",
    Name: "AKSHAYAA.M.D",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040001",
    Name: "AKSITA. S",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA19050029",
    Name: "AVYUKT.G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA16020005",
    Name: "DEEPAN N",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA23090005",
    Name: "DEVIYANI G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA23090004",
    Name: "DHANALYA R",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA20060031",
    Name: "HARI VARSHAN.M",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040007",
    Name: "JAIKRRISH. N",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040010",
    Name: "KANAKA CHALLAKUMAR. C",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040011",
    Name: "KANESKHUMARAN. V.G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA21070038",
    Name: "KAVI NANDHAN",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA24100001",
    Name: "LAVAN MITHRAN A.G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA21070039",
    Name: "MAHATHI P",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA19060030",
    Name: "MOHAMED FAIZAL SALMAN.K.M",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA16020015",
    Name: "NANDHAKISHORE. K.S",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA20060034",
    Name: "NEVAASHNI.A",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA24100002",
    Name: "SAI RAKSHA. A",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA17030019",
    Name: "SANJAN. K",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA16020020",
    Name: "SARVIN. A",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA16020021",
    Name: "SHARAN. G",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040024",
    Name: "SHUGHA.D",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA20060032",
    Name: "SUCHIT.P.S",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA18040025",
    Name: "THANISHKA. V",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA20060035",
    Name: "VANSHIKHA.J",
    Class: "7A",
  },
  {
    Enrollment_Id: "TVA16020026",
    Name: "VARUN. VU",
    Class: "7A",
  },
];

module.exports = { baseStudents };
