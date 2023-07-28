import React, { useRef, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, FormInstance } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

interface TableItem {
  key: string;
  name: string;
  date: string;
  numericValue: number;
}

const TableComponent: React.FC = () => {
  const formRef = useRef<FormInstance>(null);
  // State для хранения данных таблицы и модального окна
  const [data, setData] = useState<TableItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<TableItem | null>(null);

  // State для поиска
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<string | undefined>(
    undefined
  );

  // Функция для обновления состояния поиска
  const handleSearch = (
    selectedKeys: React.Key[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0] as string);
    setSearchedColumn(dataIndex);
  };

  // Функция для сброса фильтра поиска
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // Объект с настройками фильтрации поиска
  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Поиск по ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value + "\u0378"] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Поиск
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Сбросить
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase().slice(0, -1)),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => {
          const input = document.querySelector(
            ".ant-table-filter-dropdown input"
          ) as HTMLInputElement;
          input?.focus();
        }, 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  // функция фильтра
  function filterData(data: TableItem[], searchText: string) {
    if (!searchText) {
      return data;
    }

    const searchNumber = Number(searchText);

    return data.filter((item: TableItem) => {
      // Для числовых значений делаем проверку на вхождение
      if (
        !isNaN(searchNumber) &&
        item.numericValue.toString().includes(searchText)
      ) {
        return true;
      }

      // Для остальных столбцов ищем частичные совпадения
      return (
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.date.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }

  // Функция для отображения модального окна с формой
  const showModal = (item?: TableItem) => {
    setModalData(item || null);
    setIsModalVisible(true);
  };

  // Функция для скрытия модального окна
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Функция для добавления или редактирования элемента таблицы
  const handleOk = (values: TableItem) => {
    if (modalData) {
      // Редактирование существующего элемента
      const updatedData = data.map((item) =>
        item.key === modalData.key ? { ...item, ...values } : item
      );
      setData(updatedData);
    } else {
      // Добавление нового элемента
      const newItem: TableItem = { ...values, key: String(Date.now()) };
      setData([...data, newItem]);
    }
    setIsModalVisible(false);
  };

  // Функция для удаления элемента из таблицы
  const handleDelete = (key: string) => {
    const filteredData = data.filter((item) => item.key !== key);
    setData(filteredData);
  };

  // Колонки таблицы
  const columns = [
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      ...getColumnSearchProps("date"),
    },
    {
      title: "Числовое значение",
      dataIndex: "numericValue",
      key: "numericValue",
      ...getColumnSearchProps("numericValue"),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: TableItem) => (
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Кнопка "Добавить" и фильтр для поиска */}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>
          Добавить
        </Button>
        <Input
          placeholder="Поиск по всем колонкам"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginLeft: 8 }}
        />
      </div>
      {/* Модальное окно */}
      <Modal
        title={modalData ? "Редактирование элемента" : "Добавление элемента"}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={() => {
          const form = formRef.current;
          form?.submit();
        }}
      >
        <Form
          id="modalForm"
          layout="vertical"
          onFinish={(values) => handleOk(values as TableItem)}
          initialValues={modalData || {}}
          ref={formRef}
        >
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Дата"
            name="date"
            rules={[
              { required: true, message: "Введите дату" },
              {
                pattern: /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/,
                message: "Введите дату в формате ДД.ММ.ГГГГ",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Числовое значение"
            name="numericValue"
            rules={[{ required: true, message: "Введите числовое значение" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Таблица */}
      <Table dataSource={filterData(data, searchText)} columns={columns} />
    </div>
  );
};

export default TableComponent;
