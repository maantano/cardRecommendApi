const express = require("express");
const app = express();
const PORT = process.env.port || 8001;
const csv = require("csv-parser");
const fs = require("fs");
// cors ???
const cors = require("cors");
let corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// DB 연결
const mysql = require("mysql");
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "alsruddjs5",
  database: "card",
  port: 3306,
});

// 서버 연결 했을때 최초 대기 상태
app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});

app.get("/", (req, res) => {
  const sqlQuery = "INSERT INTO test01 (user_id) VALUES (1)";
  db.query(sqlQuery, (err, result) => {
    console.log(err);
    console.log("insert");
  });
});

app.get("/test1", (req, res) => {
  const selectQ = "SELECT * FROM TEST01";
  db.query(selectQ, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log(err);
    }
  });
});

app.get("/api/cardAll", (req, res) => {
  const selectQ = "SELECT * FROM cardAll";
  db.query(selectQ, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log("/api/cardAll err==>", err);
    }
  });
});
app.post("/api/randomCard", (req, res) => {
  const query = "SELECT * FROM cardAll ORDER BY RAND() LIMIT 20";

  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error("MySQL 쿼리 오류:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});
app.post("/api/cardCorporationList", (req, res) => {
  // cardAll 테이블에서 랜덤으로 6개의 레코드를 가져오는 SQL 쿼리
  const query = "SELECT * FROM cardCo";

  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error("MySQL 쿼리 오류:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

const bodyParser = require("body-parser");
const multer = require("multer");
const { PythonShell } = require("python-shell");
const path = require("path");
const { spawn } = require("child_process");
app.use(bodyParser.json()); // JSON 형식의 요청 본문을 파싱
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 요청 본문을 파싱

let lastCardTypeChk = null;

app.post("/api/targetCard", (req, res) => {
  // cardAll 테이블에서 랜덤으로 6개의 레코드를 가져오는 SQL 쿼리
  let { targetId } = req.body;
  const query = `SELECT * FROM cardAll where id = '${targetId}'`;

  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error("MySQL 쿼리 오류:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});
app.post("/api/cardCorporation", (req, res) => {
  let { corporationTarget } = req.body;
  const query = `SELECT * FROM cardAll WHERE cardCoId = '${corporationTarget}'`;
  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error("MySQL 쿼리 오류:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/api/categoryCount", (req, res) => {
  let { checkedList, cardType, refresh } = req.body;
  if (refresh) {
    if (!cardType && lastCardTypeChk) {
      cardType = lastCardTypeChk;
    }
  }

  let query = "";
  if (!checkedList || checkedList.length > 0) {
    if (!checkedList || !Array.isArray(checkedList)) {
      query = `SELECT * FROM cardAll WHERE cardType = '${cardType}'`;
    } else {
      const categories = checkedList.join("','");

      if (cardType.length > 0) {
        const likeClauses = checkedList
          .map((category) => `benefit LIKE '%${category}%'`)
          .join(" OR ");
        query = `SELECT * FROM cardAll WHERE (${likeClauses}) AND cardType = '${cardType}'`;
      } else {
        const likeClauses = checkedList
          .map((category) => `benefit LIKE '%${category}%'`)
          .join(" OR ");
        query = `SELECT * FROM cardAll WHERE ${likeClauses}`;
      }
    }
  } else {
    if (cardType.length > 0) {
      query = `SELECT * FROM cardAll WHERE cardType = '${cardType}'`;
    } else {
      query = `SELECT * FROM cardAll`;
    }
  }

  // console.log("query ----->", query);
  db.query(query, (err, result) => {
    if (!err) {
      lastCardTypeChk = cardType;
      res.send(result);
    } else {
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/api/summary3", (req, res) => {
  let { checkedList, cardType } = req.body;
  cardType = "credit";
  let query = "";
  if (!checkedList || checkedList.length > 0) {
    if (!checkedList || !Array.isArray(checkedList)) {
      query = `SELECT * FROM cardAll WHERE cardType = '${cardType}'`;
    } else {
      // const categories = checkedList.join("','");
      const categories = checkedList;
      query = `SELECT * FROM cardAll WHERE benefitKor LIKE '%${categories}%'`;
      // query = `SELECT * FROM cardAll WHERE benefitKor IN ('${categories}')`;
    }
  } else {
    query = `SELECT * FROM cardAll`;
  }
  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/api/cardAll/credit", (req, res) => {
  const selectQ = "SELECT id FROM cardAll where cardType='credit'";
  db.query(selectQ, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log("/api/cardAll/credit err==>", err);
    }
  });
});
app.get("/api/cardAll/debit", (req, res) => {
  const selectQ = "SELECT id FROM cardAll where cardType='debit'";
  db.query(selectQ, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log("/api/cardAll/debit err==>", err);
    }
  });
});

app.get("/api/cardBenefit", (req, res) => {
  const selectQ = "SELECT * FROM cardBenefit";
  db.query(selectQ, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log("/api/cardBenefit err==>", err);
    }
  });
});

app.get("/api/company", (req, res) => {
  const q = "select * from company";
  db.query(q, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log(err);
    }
  });
});

app.post("/api/search/cardList", (req, res) => {
  let {
    amount,
    prevRec,
    selectCard,
    type,
    bankList,
    listCate,
    cardCorp,
    checkBenefitList,
    top3Benefit,
  } = req.body;
  let query = "";
  const amount0 = amount[0];
  const amount1 = amount[1];
  const prevRec0 = prevRec[0];
  const prevRec1 = prevRec[1];

  if (!checkBenefitList || checkBenefitList.length < 1) {
    checkBenefitList = [
      "beauty09",
      "bussiness24",
      "cafe08",
      "car15",
      "edu14",
      "ePay18",
      "food07",
      "gas03",
      "hospital12",
      "leisure16",
      "lounge20",
      "market05",
      "mobile04",
      "movie17",
      "noPer10",
      "overseas23",
      "pet13",
      "plane19",
      "premium21",
      "rent11",
      "shop06",
      "travle22",
      "traffic02",
      "subscribe24",
    ];
  }
  const combinedCategoriesString2 = "'" + checkBenefitList.join("','") + "'";

  if (selectCard === "카드 선택")
    selectCard = [
      "국민카드",
      "신한카드",
      "우리카드",
      "하나카드",
      "NH농협카드",
      "현대카드",
      "삼성카드",
      "롯데카드",
      "IBK카드",
      "BC카드",
    ].join("','");
  const likeConditions = checkBenefitList
    .map((benefit) => `benefit LIKE '%${benefit}%'`)
    .join(" OR ");

  if (type === "credit" || type === "debit") {
    if (selectCard) {
      query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND (${likeConditions}) AND cardType = '${type}'  AND cardCoKor IN ('${selectCard}')`;
      // query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND benefit IN (${combinedCategoriesString2}) AND cardType = '${type}'  AND cardCoKor IN ('${selectCard}')`;
    } else {
      query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND cardType = '${type}' AND (${likeConditions})`;
      // query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND cardType = '${type}' AND (benefit IN (${combinedCategoriesString2}) OR ${likeConditions})`;
    }
  }

  if (type === "pYear" || type === "present" || type === "cashBack") {
    if (selectCard) {
      query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND (${likeConditions}) AND eventType = '${type}' AND cardCoKor IN ('${selectCard}')`;
    } else {
      query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND eventType = '${type}' AND (${likeConditions})`;
    }
  }
  if (!type) {
    let top3BenefitCombine = "";
    if (top3Benefit) {
      top3BenefitCombine = top3Benefit
        .map((benefit) => `benefitKor LIKE '%${benefit}%'`)
        .join(" OR ");
    }
    if (selectCard.length > 0) {
      query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND (${top3BenefitCombine}) AND cardCoKor IN ('${selectCard}')`;
    } else {
      if (top3BenefitCombine.length > 0) {
        query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1}) AND (${top3BenefitCombine})`;
      } else {
        query = `SELECT * FROM cardAll WHERE (annualFee BETWEEN ${amount0} AND ${amount1}) AND (prevRecord BETWEEN ${prevRec0} AND ${prevRec1})`;
      }
    }
  }

  db.query(query, (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log("/api/search/cardList==>", err);
    }
  });
});

let lastEventTypeChk = null;
app.post("/api/bankCount", (req, res) => {
  let { checkedBankList, eventType } = req.body;
  if (!eventType && lastEventTypeChk) {
    eventType = lastEventTypeChk;
  }
  let query = "";
  if (!checkedBankList || checkedBankList.length > 0) {
    if (!checkedBankList || !Array.isArray(checkedBankList)) {
      query = `SELECT * FROM cardAll WHERE eventType = '${eventType}'`;
    } else {
      const bankList = checkedBankList.join("','");
      if (eventType.length > 0) {
        query = `SELECT * FROM cardAll WHERE cardCo IN ('${bankList}') and eventType = '${eventType}'`;
      } else {
        query = `SELECT * FROM cardAll WHERE cardCo IN ('${bankList}')`;
      }
    }
  } else {
    if (eventType.length > 0) {
      query = `SELECT * FROM cardAll WHERE eventType = '${eventType}'`;
    } else {
      query = `SELECT * FROM cardAll`;
    }
  }
  // console.log(query);
  db.query(query, (err, result) => {
    if (!err) {
      lastEventTypeChk = eventType;
      res.send(result);
    } else {
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/api/summaryBenefit", (req, res) => {
  try {
    const { top3Codes } = req.body;
    const benefitIdsByCategory = {};
    // 모든 카테고리의 결과를 모으기 위한 Promise 배열
    const promises = top3Codes.map((category) => {
      const categoryName = category[0];

      const query = `SELECT id FROM cardBenefit WHERE summaryCategory LIKE '%${categoryName}%'`;

      return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (!err) {
            const ids = result.map((row) => row.id);
            benefitIdsByCategory[categoryName] = { ids, rank: category[1] };
            resolve(); // 해당 카테고리의 결과를 수집한 경우 resolve 호출
          } else {
            reject(err); // 에러 발생 시 reject 호출
          }
        });
      });
    });

    // 모든 Promise들이 완료된 후 응답 보내기
    Promise.all(promises)
      .then(() => {
        const sortedCategories = Object.keys(benefitIdsByCategory).sort(
          (a, b) => benefitIdsByCategory[b].rank - benefitIdsByCategory[a].rank
        );

        const sortedResult = {};
        sortedCategories.forEach((category, index) => {
          sortedResult[index + 1] = benefitIdsByCategory[category].ids;
        });

        res.send(sortedResult);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/top3Benefit", (req, res) => {
  try {
    // console.log(req.body);
    const { top3Benefit } = req.body;
    const resultObj = {};
    Object.keys(top3Benefit).forEach((category) => {
      const values = top3Benefit[category];
      const combineValues = `('${values.join("','")}')`;

      const query = `SELECT name,id FROM cardBenefit WHERE id in ${combineValues}`;

      db.query(query, (err, result) => {
        if (!err) {
          resultObj[category] = result.map((row) => ({
            id: row.id,
            name: row.name,
          }));
        } else {
          res.status(500).send("Internal Server Error");
        }

        if (Object.keys(resultObj).length === Object.keys(top3Benefit).length) {
          res.send(resultObj);
        }
      });
      // 여기서 원하는 작업 수행
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/top3Card", async (req, res) => {
  try {
    const { top3BenefitId } = req.body;
    const resultObj = {};

    // 배열에 저장된 id들을 활용하여 쿼리문 동적 생성 및 실행
    for (const benefitId of top3BenefitId) {
      let tableName = "";
      if (
        benefitId === "cafe08" ||
        benefitId === "market05" ||
        benefitId === "food07"
      ) {
        tableName = "cafeNmarketRank";
      } else {
        tableName = benefitId + "Rank";
      }

      const query = `SELECT id, benefitRank FROM ${tableName} WHERE benefitId LIKE '%${benefitId}%' AND benefitRank IN (1, 2, 3)`;

      const result = await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      resultObj[benefitId] = result.map((row) => ({
        id: row.id,
        benefitRank: row.benefitRank,
      }));
    }
    const allIds = top3BenefitId.reduce((ids, benefitId) => {
      return ids.concat(resultObj[benefitId].map((item) => item.id));
    }, []);

    // cardAll 테이블에서 추출한 id들에 대한 데이터를 가져와서 결과 생성
    const allQuery = `SELECT * FROM cardAll WHERE id IN ('${allIds.join(
      "', '"
    )}')`;

    const allResult = await new Promise((resolve, reject) => {
      db.query(allQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // 결과 데이터를 benefitId 별로 9개씩 나눠서 객체화하여 전송
    const dividedResults = top3BenefitId.map((benefitId) => {
      const matchingData = allResult.filter((item) =>
        resultObj[benefitId].some((row) => row.id === item.id)
      );
      const dividedData = [];
      for (let i = 0; i < matchingData.length; i += 3) {
        dividedData.push(matchingData.slice(i, i + 3));
      }
      return { benefitId, dividedData };
    });
    res.send(dividedResults);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/api/top3Card2", async (req, res) => {
  try {
    const { top3BenefitId } = req.body;
    const resultObj = {};

    // Iterate through each benefitId and fetch the data
    for (const benefitId of top3BenefitId) {
      let tableName = "";
      if (
        benefitId === "cafe08" ||
        benefitId === "market05" ||
        benefitId === "food07"
      ) {
        tableName = "cafeNmarketRank";
      } else {
        tableName = benefitId + "Rank";
      }

      const query = `SELECT id, benefitRank FROM ${tableName} WHERE benefitId LIKE '%${benefitId}%' AND benefitRank IN (1, 2, 3)`;

      const result = await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      resultObj[benefitId] = result.map((row) => ({
        id: row.id,
        benefitRank: row.benefitRank,
      }));
    }
    const idCounts = {};
    for (const benefitId of top3BenefitId) {
      for (const row of resultObj[benefitId]) {
        if (!idCounts[row.id]) {
          idCounts[row.id] = 1;
        } else {
          idCounts[row.id]++;
        }
      }
    }
    const sortedIds = Object.keys(idCounts).sort((a, b) => {
      const aData = resultObj[a] || [];
      const bData = resultObj[b] || [];

      if (idCounts[b] === idCounts[a]) {
        return (
          aData.findIndex((item) => item.id === a) -
          bData.findIndex((item) => item.id === b)
        );
      }
      return idCounts[b] - idCounts[a];
    });
    const selectedIds = sortedIds.slice(0, 3);
    const selectedData = await new Promise((resolve, reject) => {
      const allQuery = `SELECT * FROM cardAll WHERE id IN ('${selectedIds.join(
        "', '"
      )}')`;
      db.query(allQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.send(selectedData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// 업로드된 파일 저장 디렉토리 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${timestamp}${extname}`);
  },
});

const upload = multer({ storage });
app.use(express.static("public"));

// app.post("/upload", upload.single("file"), async (req, res) => {
//   const uploadedFilePath = req.file.path;
//   const shortFileName = "py.csv";

//   const newPath = path.join(path.dirname(uploadedFilePath), shortFileName);
//   console.log("newPath =====>", newPath);
//   fs.renameSync(uploadedFilePath, newPath);

//   const pythonScriptPath = path.join(__dirname, "machine_learning_script.py");

//   const csvData = [];
//   fs.createReadStream(newPath)
//     .pipe(csv())
//     .on("data", (row) => {
//       csvData.push(row);
//     })
//     .on("end", async () => {
//       try {
//         const results = await runPythonScript(pythonScriptPath, [
//           newPath, // 파일 경로 전달
//         ]);
//         console.log("Python script results:", results);

//         const predictionResult = JSON.parse(results);
//         res.json(predictionResult);
//       } catch (error) {
//         console.error("머신 러닝 중 오류 발생:", error);
//         res.status(500).json({ error: "머신 러닝 중 오류가 발생했습니다." });
//       }
//     });
// });
app.post("/upload", upload.single("file"), async (req, res) => {
  const uploadedFilePath = req.file.path;
  const shortFileName = "py.csv";

  const pythonScriptPath = path.join(__dirname, "machine_learning_script.py");

  const csvData = [];
  fs.createReadStream(uploadedFilePath)
    .pipe(csv())
    .on("data", (row) => {
      csvData.push(row);
    })
    .on("end", async () => {
      try {
        const results = await runPythonScript(
          pythonScriptPath,
          JSON.stringify(csvData)
        ); // CSV 데이터를 JSON 문자열로 변환
        console.log("Python script results:", results);

        const predictionResult = JSON.parse(results);
        res.json(predictionResult);
      } catch (error) {
        console.error("머신 러닝 중 오류 발생:", error);
        res.status(500).json({ error: "머신 러닝 중 오류가 발생했습니다." });
      }
    });
});

async function runPythonScript(scriptPath, csvData) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("/opt/homebrew/bin/python3", [
      scriptPath,
      JSON.stringify(csvData), // CSV 데이터를 JSON 문자열로 전달
    ]);

    let pythonOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      pythonOutput += output;
      console.log("Python Output:", output);
    });

    pythonProcess.stderr.on("data", (data) => {
      const errorOutput = data.toString();
      console.error("Python Error Output:", errorOutput);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(pythonOutput);
      } else {
        reject(`Python script exited with code ${code}`);
      }
    });
  });
}
